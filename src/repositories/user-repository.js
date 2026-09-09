import { PrismaClient } from "@prisma/client";
import {
  iniDatabaseUrl,
  watchlabDatabaseUrl,
} from "../database/database-urls.js";

class UserRepository {
  constructor(databaseUrl, label) {
    this.label = label;
    this.isIni = label === "INI Dating";
    this.prisma = new PrismaClient({
      datasources: { db: { url: databaseUrl } },
    });
    this.checkConnection();
  }
  async checkConnection() {
    try {
      await this.prisma.$connect();
      console.log(`${this.label} database connection successful.`);
    } catch (error) {
      console.error(`${this.label} database connection failed:`, error);
    }
  }
  async updateUserAvatar(userId, filePath) {
    try {
      if (this.isIni) {
        await this.prisma
          .$executeRaw`UPDATE user_profiles SET avatar_id = ${filePath}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${Number(userId)}`;
        return this.getUserById(userId);
      }
      return await this.prisma.users.update({
        where: { user_id: parseInt(userId, 10) },
        data: { avatar: filePath },
      });
    } catch (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
  }

  async getAssignViewTable(viewTablename, limit) {
    try {
      if (!viewTablename) {
        throw new Error("viewTablename 不能是空字符串");
      }
      //console.log(customViewData);
      console.log(viewTablename);

      let customQuery = `SELECT * FROM ${viewTablename}`;
      if (limit && !isNaN(limit) && limit > 0) {
        customQuery += ` LIMIT ${limit}`;
      }

      let customQueryCallbackData =
        await this.prisma.$queryRawUnsafe(customQuery);

      console.log(customQueryCallbackData);

      return customQueryCallbackData;
    } catch (error) {
      console.error("發生錯誤：", error.message);
    }
  }
  async findUserByAccount(account) {
    return this.prisma.users.findUnique({
      where: { user_account: account },
    });
  }

  async findUserByLogin(account) {
    const normalized = account.trim().toLowerCase();
    if (this.isIni) {
      const rows = await this.prisma.$queryRaw`
        SELECT u.*, p.display_name AS username, p.birthdate, p.gender,
               p.gender_changed_at, p.avatar_id AS avatar
        FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id
        WHERE u.user_account = ${normalized} OR u.email = ${normalized} OR u.phone = ${normalized}
        LIMIT 1`;
      return rows[0] ?? null;
    }
    return this.prisma.users.findFirst({
      where: {
        OR: [
          { user_account: normalized },
          { email: normalized },
          { phone: normalized },
        ],
      },
    });
  }

  async createUser(data) {
    if (this.isIni) {
      return this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`INSERT INTO users (user_account, password_hash, email, phone, created_at, updated_at, is_banned) VALUES (${data.user_account}, ${data.password_hash}, ${data.email}, ${data.phone}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE)`;
        const ids = await tx.$queryRaw`SELECT LAST_INSERT_ID() AS user_id`;
        const userId = Number(ids[0].user_id);
        await tx.$executeRaw`INSERT INTO user_profiles (user_id, display_name, birthdate, gender, profile_initialized, created_at, updated_at) VALUES (${userId}, ${data.username}, ${data.birthdate}, ${data.gender}, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        return {
          ...data,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
          is_banned: false,
        };
      });
    }
    return this.prisma.users.create({ data });
  }

  async updateGenderIfAllowed(userId, gender, cutoff, changedAt) {
    if (this.isIni) {
      const changed = await this.prisma
        .$executeRaw`UPDATE user_profiles SET gender = ${gender}, gender_changed_at = ${changedAt}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${Number(userId)} AND gender <> ${gender} AND (gender_changed_at IS NULL OR gender_changed_at <= ${cutoff})`;
      return changed ? this.getUserById(userId) : null;
    }
    const result = await this.prisma.users.updateMany({
      where: {
        user_id: Number(userId),
        gender: { not: gender },
        OR: [
          { gender_changed_at: null },
          { gender_changed_at: { lte: cutoff } },
        ],
      },
      data: { gender, gender_changed_at: changedAt },
    });
    if (!result.count) return null;
    return this.getUserById(userId);
  }

  async updateBirthdate(userId, birthdate) {
    if (this.isIni) {
      await this.prisma
        .$executeRaw`UPDATE user_profiles SET birthdate = ${birthdate}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ${Number(userId)}`;
      return this.getUserById(userId);
    }
    return this.prisma.users.update({
      where: { user_id: Number(userId) },
      data: { birthdate },
    });
  }

  async updateLocation(userId, location) {
    await this.prisma.$executeRaw`
      UPDATE user_profiles
      SET latitude = ${location.latitude}, longitude = ${location.longitude},
          location_accuracy_meters = ${location.accuracyMeters},
          city = COALESCE(NULLIF(${location.city}, ''), city),
          location_updated_at = CURRENT_TIMESTAMP(3), updated_at = CURRENT_TIMESTAMP(3)
      WHERE user_id = ${Number(userId)}`;
    return this.getUserById(userId);
  }

  async getCustomOptions(userId) {
    const rows = await this.prisma.$queryRaw`
      SELECT location, city, headline, bio, zodiac, relationship, looking_for,
             profile_initialized
      FROM user_profiles
      WHERE user_id = ${Number(userId)}
      LIMIT 1
    `;
    const result = {
      location: rows[0]?.location ?? "",
      city: rows[0]?.city ?? rows[0]?.location ?? "",
      headline: rows[0]?.headline ?? "",
      bio: rows[0]?.bio ?? "",
      tags: [],
      interests: [],
      custom_tags: [],
      custom_interests: [],
      zodiac: rows[0]?.zodiac ?? "",
      relationship: rows[0]?.relationship ?? "",
      looking_for: rows[0]?.looking_for ?? "",
      profile_initialized: Boolean(rows[0]?.profile_initialized),
    };
    const selections = await this.prisma
      .$queryRaw`SELECT option_type, option_key FROM user_profile_options WHERE user_id = ${Number(userId)} ORDER BY id`;
    const custom = await this.prisma
      .$queryRaw`SELECT option_type, value FROM user_custom_options WHERE user_id = ${Number(userId)} ORDER BY id`;
    result.tags = selections
      .filter((row) => row.option_type === "tag")
      .map((row) => row.option_key);
    result.interests = selections
      .filter((row) => row.option_type === "interest")
      .map((row) => row.option_key);
    result.custom_tags = custom
      .filter((row) => row.option_type === "tag")
      .map((row) => row.value);
    result.custom_interests = custom
      .filter((row) => row.option_type === "interest")
      .map((row) => row.value);
    return result;
  }

  async updateCustomOptions(userId, profile) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
      UPDATE user_profiles
      SET display_name = ${profile.name},
          avatar_id = ${profile.image},
          location = ${profile.location},
          city = ${profile.city},
          latitude = ${profile.latitude},
          longitude = ${profile.longitude},
          headline = ${profile.headline},
          bio = ${profile.bio},
          zodiac = ${profile.zodiac},
          relationship = ${profile.relationship},
          looking_for = ${profile.looking_for},
          profile_initialized = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${Number(userId)}
      `;
      await tx.$executeRaw`DELETE FROM user_profile_options WHERE user_id = ${Number(userId)}`;
      await tx.$executeRaw`DELETE FROM user_custom_options WHERE user_id = ${Number(userId)}`;
      for (const optionKey of profile.tags)
        await tx.$executeRaw`INSERT INTO user_profile_options (user_id, option_type, option_key, created_at) VALUES (${Number(userId)}, 'tag', ${optionKey}, CURRENT_TIMESTAMP)`;
      for (const optionKey of profile.interests)
        await tx.$executeRaw`INSERT INTO user_profile_options (user_id, option_type, option_key, created_at) VALUES (${Number(userId)}, 'interest', ${optionKey}, CURRENT_TIMESTAMP)`;
      for (const value of profile.custom_tags)
        await tx.$executeRaw`INSERT INTO user_custom_options (user_id, option_type, value, normalized_value, moderation_status, created_at) VALUES (${Number(userId)}, 'tag', ${value}, ${value.toLocaleLowerCase()}, 'approved', CURRENT_TIMESTAMP)`;
      for (const value of profile.custom_interests)
        await tx.$executeRaw`INSERT INTO user_custom_options (user_id, option_type, value, normalized_value, moderation_status, created_at) VALUES (${Number(userId)}, 'interest', ${value}, ${value.toLocaleLowerCase()}, 'approved', CURRENT_TIMESTAMP)`;
    });
    return {
      ...profile,
      username: profile.name,
      avatar: profile.image,
      profile_initialized: true,
    };
  }

  async getUserById(id) {
    const userId = parseInt(id, 10);
    if (this.isIni) {
      const rows = await this.prisma
        .$queryRaw`SELECT u.*, p.display_name AS username, p.birthdate, p.gender, p.gender_changed_at, p.avatar_id AS avatar, p.location, p.city, p.location_updated_at, p.headline, p.bio, p.profile_initialized FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id WHERE u.user_id = ${userId} LIMIT 1`;
      return rows[0] ?? null;
    }

    // Query the database using the converted numeric id
    return await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }
  async getAllUsers() {
    return await this.prisma.users.findMany();
  }

  async deleteUser(userId) {
    if (this.isIni)
      return this.prisma
        .$executeRaw`DELETE FROM users WHERE user_id = ${Number(userId)}`;
    return this.prisma.users.delete({ where: { user_id: Number(userId) } });
  }
}
const UserRepositoryInstance = new UserRepository(
  watchlabDatabaseUrl,
  "WatchLab",
);
export const iniUserRepository = new UserRepository(
  iniDatabaseUrl,
  "INI Dating",
);

export default UserRepositoryInstance;

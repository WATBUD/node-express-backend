import { generateToken } from "../utilities/jwt-helper.js";
import { hashPassword, verifyPassword } from "../utilities/password-helper.js";
import {
  consumeVerification,
  requestVerification,
} from "./verification-service.js";
import { showIniTestData } from "../config/runtime-config.js";

const GENDER_CHANGE_DAYS = 30;
const listOrEmpty = (value) => (Array.isArray(value) ? value : []);
const publicUser = (user) => ({
  id: user.user_id,
  account: user.user_account,
  name: user.username,
  email: user.email,
  phone: user.phone,
  birthdate: user.birthdate ? user.birthdate.toISOString().slice(0, 10) : null,
  gender: user.gender,
  gender_changed_at: user.gender_changed_at,
  image: user.avatar ?? "",
  location: user.location ?? "",
  city: user.city ?? user.location ?? "",
  locationUpdatedAt: user.location_updated_at ?? null,
  lastActiveAt: user.last_active_at ?? null,
  headline: user.headline ?? "",
  bio: user.bio ?? "",
  tags: listOrEmpty(user.tags),
  interests: listOrEmpty(user.interests),
  custom_tags: listOrEmpty(user.custom_tags),
  custom_interests: listOrEmpty(user.custom_interests),
  zodiac: user.zodiac ?? "",
  relationship: user.relationship ?? "",
  looking_for: user.looking_for ?? "",
  profile_initialized: Boolean(user.profile_initialized),
  createdAt: user.created_at,
});
const authError = (message, statusCode, code) =>
  Object.assign(new Error(message), { statusCode, code });
const CUSTOM_OPTION_MIN_LENGTH = 2;
const CUSTOM_OPTION_MAX_LENGTH = 20;
const CUSTOM_OPTION_MAX_COUNT = 2;
const CONTACT_PATTERN =
  /(https?:\/\/|www\.|\S+@\S+\.\S+|\b\d{8,}\b|(?:line|instagram|facebook|telegram|wechat|whatsapp|ig|fb)\s*[:：@])/i;
const INAPPROPRIATE_PATTERN =
  /(色情|約炮|援交|毒品|詐騙|仇恨|sex\s*trade|drug\s*deal)/i;
const TAG_IDS = new Set([
  "slow-warm",
  "loves-travel",
  "night-owl",
  "cat-person",
  "dog-person",
  "outdoors",
  "homebody",
  "quiet-company",
]);
const INTEREST_IDS = new Set([
  "coffee",
  "travel",
  "music",
  "photography",
  "walking",
  "food",
  "fitness",
  "movies",
  "reading",
  "cats",
  "dogs",
  "gaming",
  "painting",
  "hiking",
  "cooking",
  "yoga",
]);
const FEMALE_AVATARS = new Set([
  "moon-cat",
  "forest-fox",
  "female-rose-persian",
  "female-lantern-fennec",
  "female-tea-rabbit",
  "female-blossom-fawn",
  "female-moon-dragon",
  "female-flower-pomeranian",
  "female-moon-swan",
  "female-coral-axolotl",
  "female-sakura-calico",
  "female-orchard-red-panda",
  "female-aurora-owl",
  "female-lily-otter",
  "female-meadow-alpaca",
  "female-mushroom-hedgehog",
  "female-orchard-squirrel",
]);
const MALE_AVATARS = new Set([
  "star-dragon",
  "male-moon-shiba",
  "male-river-otter",
  "male-sun-lion",
  "male-aurora-wolf",
  "male-autumn-rabbit",
  "male-polar-penguin",
  "male-bamboo-red-panda",
  "male-crystal-seal",
  "male-scholar-owl",
  "male-clockwork-tabby",
  "male-sky-corgi",
  "male-lagoon-turtle",
  "male-star-hamster",
  "male-mountain-panda",
  "male-sky-griffin",
]);
const normalizeCustomOption = (value) => value.trim().replace(/\s+/g, " ");
const validateCustomOptions = (values) => {
  if (!Array.isArray(values) || values.length > CUSTOM_OPTION_MAX_COUNT) {
    throw authError(
      "Invalid custom profile options.",
      400,
      "INVALID_CUSTOM_OPTION",
    );
  }
  const normalized = values.map(normalizeCustomOption);
  const unique = new Set(normalized.map((value) => value.toLocaleLowerCase()));
  const invalid = normalized.some((value) => {
    const length = Array.from(value).length;
    return (
      length < CUSTOM_OPTION_MIN_LENGTH ||
      length > CUSTOM_OPTION_MAX_LENGTH ||
      CONTACT_PATTERN.test(value) ||
      INAPPROPRIATE_PATTERN.test(value)
    );
  });
  if (invalid || unique.size !== normalized.length) {
    throw authError(
      "Invalid custom profile options.",
      400,
      "INVALID_CUSTOM_OPTION",
    );
  }
  return normalized;
};
const validatePresetOptions = (values, allowed, max, customCount) => {
  if (
    !Array.isArray(values) ||
    values.length + customCount > max ||
    new Set(values).size !== values.length ||
    values.some((value) => !allowed.has(value))
  ) {
    throw authError("Invalid profile options.", 400, "INVALID_PROFILE_OPTION");
  }
  return values;
};
const parseBirthdate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date;
};
const ageAt = (birthdate, today = new Date()) => {
  let age = today.getUTCFullYear() - birthdate.getUTCFullYear();
  if (
    today.getUTCMonth() < birthdate.getUTCMonth() ||
    (today.getUTCMonth() === birthdate.getUTCMonth() &&
      today.getUTCDate() < birthdate.getUTCDate())
  )
    age -= 1;
  return age;
};
const CITY_COORDINATES = new Map([
  ["台北市", [25.033, 121.5654]],
  ["新北市", [25.017, 121.4628]],
  ["桃園市", [24.9936, 121.301]],
  ["台中市", [24.1477, 120.6736]],
  ["台南市", [22.9999, 120.227]],
  ["高雄市", [22.6273, 120.3014]],
  ["基隆市", [25.1276, 121.7392]],
  ["新竹市", [24.8138, 120.9675]],
  ["嘉義市", [23.4801, 120.4491]],
  ["新竹縣", [24.8387, 121.0177]],
  ["苗栗縣", [24.5602, 120.8214]],
  ["彰化縣", [24.0756, 120.544]],
  ["南投縣", [23.9609, 120.9719]],
  ["雲林縣", [23.7092, 120.4313]],
  ["嘉義縣", [23.4518, 120.2555]],
  ["屏東縣", [22.5519, 120.5488]],
  ["宜蘭縣", [24.7021, 121.7378]],
  ["花蓮縣", [23.9911, 121.6112]],
  ["台東縣", [22.7554, 121.15]],
  ["澎湖縣", [23.5712, 119.5793]],
  ["金門縣", [24.4494, 118.3767]],
  ["連江縣", [26.1602, 119.9517]],
]);

export default class AuthService {
  constructor(userRepository) {
    this.users = userRepository;
  }

  async requestCode({ channel, destination }) {
    const existing = await this.users.findUserByLogin(destination);
    if (existing)
      throw authError("這個手機或 Email 已經註冊", 409, "ACCOUNT_EXISTS");
    return requestVerification(channel, destination);
  }

  async register(input) {
    const destination = input.channel === "phone" ? input.phone : input.email;
    if (
      !destination ||
      input.account.toLowerCase() !== destination.toLowerCase()
    ) {
      throw authError("帳號與驗證聯絡方式不一致", 400, "ACCOUNT_MISMATCH");
    }
    if (
      !consumeVerification(input.channel, destination, input.verificationCode)
    ) {
      throw authError("驗證碼錯誤或已經過期", 400, "INVALID_VERIFICATION_CODE");
    }
    if (await this.users.findUserByLogin(input.account)) {
      throw authError("這個帳號已經註冊", 409, "ACCOUNT_EXISTS");
    }
    const user = await this.users.createUser({
      user_account: input.account.toLowerCase(),
      username: input.account.split("@")[0],
      email: input.email || null,
      phone: input.phone || null,
      birthdate: new Date(input.birthdate),
      gender: input.gender,
      password_hash: await hashPassword(input.password),
    });
    const initialProfile = await this.users.updateCustomOptions(user.user_id, {
      name: user.username,
      image: input.gender === "female" ? "moon-cat" : "star-dragon",
      location: "",
      city: "",
      latitude: null,
      longitude: null,
      headline: "",
      bio: "",
      tags: [],
      interests: [],
      custom_tags: [],
      custom_interests: [],
      zodiac: "",
      relationship: "",
      looking_for: "",
    });
    return this.session({ ...user, ...initialProfile });
  }

  async login({ account, password }) {
    const user = await this.users.findUserByLogin(account);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw authError("帳號或密碼不正確", 401, "INVALID_CREDENTIALS");
    }
    if (!showIniTestData && user.is_test_account) {
      throw authError("Test accounts are disabled.", 403, "TEST_ACCOUNT_DISABLED");
    }
    if (user.is_banned) throw authError("帳號已停用", 403, "ACCOUNT_DISABLED");
    return this.session(user);
  }

  async me(userId) {
    const user = await this.users.getUserById(userId);
    if (!user) throw authError("找不到使用者", 404, "USER_NOT_FOUND");
    const customOptions = await this.users.getCustomOptions(userId);
    return publicUser({ ...user, ...customOptions });
  }

  async publicProfile(_viewerUserId, targetUserId) {
    const targetId = Number(targetUserId);
    if (!Number.isInteger(targetId) || targetId <= 0)
      throw authError("Invalid user id.", 400, "INVALID_USER_ID");
    const user = await this.users.getUserById(targetId);
    if (!user || user.is_banned || (!showIniTestData && user.is_test_account))
      throw authError("User not found.", 404, "USER_NOT_FOUND");
    const options = await this.users.getCustomOptions(targetId);
    const profile = publicUser({ ...user, ...options });
    return {
      id: profile.id,
      name: profile.name,
      birthdate: profile.birthdate,
      gender: profile.gender,
      image:
        profile.image ||
        (profile.gender === "female" ? "moon-cat" : "star-dragon"),
      location: profile.location,
      city: profile.city,
      lastActiveAt: profile.lastActiveAt,
      headline: profile.headline,
      bio: profile.bio,
      tags: profile.tags,
      interests: profile.interests,
      custom_tags: profile.custom_tags,
      custom_interests: profile.custom_interests,
      zodiac: profile.zodiac,
      relationship: profile.relationship,
      looking_for: profile.looking_for,
    };
  }

  async updateGender(userId, { gender }) {
    const user = await this.users.getUserById(userId);
    if (!user) throw authError("User not found.", 404, "USER_NOT_FOUND");
    if (user.gender === gender) return publicUser(user);

    const now = new Date();
    const cutoff = new Date(
      now.getTime() - GENDER_CHANGE_DAYS * 24 * 60 * 60 * 1000,
    );
    const updated = await this.users.updateGenderIfAllowed(
      userId,
      gender,
      cutoff,
      now,
    );
    if (!updated) {
      throw authError(
        "Gender can only be changed once every 30 days.",
        429,
        "GENDER_CHANGE_COOLDOWN",
      );
    }
    return publicUser(updated);
  }

  async updateBirthdate(userId, { birthdate }) {
    const user = await this.users.getUserById(userId);
    if (!user) throw authError("User not found.", 404, "USER_NOT_FOUND");
    const parsed = parseBirthdate(birthdate);
    if (!parsed)
      throw authError("Invalid birthdate.", 400, "INVALID_BIRTHDATE");
    const age = ageAt(parsed);
    if (age < 18 || age > 120)
      throw authError(
        "Birthdate must represent an age from 18 to 120.",
        400,
        "BIRTHDATE_AGE_RESTRICTED",
      );
    return publicUser(await this.users.updateBirthdate(userId, parsed));
  }

  async updateLocation(userId, input) {
    const user = await this.users.getUserById(userId);
    if (!user) throw authError("User not found.", 404, "USER_NOT_FOUND");
    const updated = await this.users.updateLocation(userId, input);
    return {
      city: updated.city ?? "",
      locationUpdatedAt: updated.location_updated_at,
    };
  }

  async updateCustomOptions(userId, input) {
    const { tags, interests, custom_tags, custom_interests } = input;
    const user = await this.users.getUserById(userId);
    if (!user) throw authError("User not found.", 404, "USER_NOT_FOUND");
    const customTags = validateCustomOptions(custom_tags);
    const customInterests = validateCustomOptions(custom_interests);
    const presetTags = validatePresetOptions(
      tags,
      TAG_IDS,
      5,
      customTags.length,
    );
    const presetInterests = validatePresetOptions(
      interests,
      INTEREST_IDS,
      8,
      customInterests.length,
    );
    const allowedAvatars =
      user.gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
    if (!allowedAvatars.has(input.image))
      throw authError(
        "Invalid avatar for gender.",
        400,
        "INVALID_PROFILE_OPTION",
      );
    const city = input.location.trim();
    const [latitude, longitude] = CITY_COORDINATES.get(city) ?? [null, null];
    const updated = await this.users.updateCustomOptions(userId, {
      name: input.name.trim(),
      image: input.image,
      location: city,
      city,
      latitude,
      longitude,
      headline: input.headline.trim(),
      bio: input.bio.trim(),
      tags: presetTags,
      interests: presetInterests,
      custom_tags: customTags,
      custom_interests: customInterests,
      zodiac: input.zodiac,
      relationship: input.relationship,
      looking_for: input.looking_for,
    });
    return publicUser({ ...user, ...updated });
  }

  async deleteAccount(userId, { password }) {
    const user = await this.users.getUserById(userId);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw authError("The password is incorrect.", 401, "INVALID_CREDENTIALS");
    }
    if (!(await this.users.deleteUser(userId)))
      throw authError("User not found.", 404, "USER_NOT_FOUND");
    return { deleted: true };
  }

  session(user) {
    return { user: publicUser(user), accessToken: generateToken(user, "7d") };
  }
}

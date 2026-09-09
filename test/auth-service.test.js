import { expect } from "chai";
import AuthService from "../src/services/auth-service.js";

class MemoryUsers {
  constructor() {
    this.users = [];
  }
  async findUserByLogin(account) {
    const value = account.toLowerCase();
    return (
      this.users.find((x) =>
        [x.user_account, x.email, x.phone].filter(Boolean).includes(value),
      ) || null
    );
  }
  async createUser(data) {
    const user = {
      ...data,
      user_id: this.users.length + 1,
      created_at: new Date(),
      is_banned: false,
    };
    this.users.push(user);
    return user;
  }
  async updateGenderIfAllowed(userId, gender, cutoff, changedAt) {
    const user = await this.getUserById(userId);
    if (
      !user ||
      user.gender === gender ||
      (user.gender_changed_at && user.gender_changed_at > cutoff)
    )
      return null;
    user.gender = gender;
    user.gender_changed_at = changedAt;
    return user;
  }
  async updateBirthdate(userId, birthdate) {
    const user = await this.getUserById(userId);
    user.birthdate = birthdate;
    return user;
  }
  async updateLocation(userId, location) {
    const user = await this.getUserById(userId);
    Object.assign(user, { ...location, location_updated_at: new Date() });
    return user;
  }
  async getCustomOptions(userId) {
    const user = await this.getUserById(userId);
    return {
      tags: user.tags || [],
      interests: user.interests || [],
      custom_tags: user.custom_tags || [],
      custom_interests: user.custom_interests || [],
    };
  }
  async updateCustomOptions(userId, profile) {
    const user = await this.getUserById(userId);
    Object.assign(user, {
      ...profile,
      username: profile.name,
      avatar: profile.image,
      profile_initialized: true,
    });
    return {
      ...profile,
      username: profile.name,
      avatar: profile.image,
      profile_initialized: true,
    };
  }
  async getUserById(id) {
    return this.users.find((x) => x.user_id === Number(id)) || null;
  }
  async deleteUser(id) {
    const index = this.users.findIndex((x) => x.user_id === Number(id));
    if (index < 0) return 0;
    this.users.splice(index, 1);
    return 1;
  }
}

describe("AuthService", () => {
  before(() => {
    process.env.JWT_SECRET = "test-secret-that-is-long-enough";
  });
  it("registers with a backend verification code and then logs in", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "email",
      destination: "hello@example.com",
    });
    expect(verification.developmentCode).to.match(/^\d{6}$/);
    const registered = await service.register({
      channel: "email",
      account: "hello@example.com",
      email: "hello@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    expect(registered.user.birthdate).to.equal("1996-05-20");
    expect(registered.user.account).to.equal("hello@example.com");
    expect(registered.user.gender).to.equal("female");
    expect(registered.accessToken).to.be.a("string");
    const loggedIn = await service.login({
      account: "hello@example.com",
      password: "Password123",
    });
    expect(loggedIn.user.id).to.equal(registered.user.id);
  });

  it("rejects an incorrect password", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "phone",
      destination: "0912345678",
    });
    await service.register({
      channel: "phone",
      account: "0912345678",
      email: "",
      phone: "0912345678",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "male",
    });
    try {
      await service.login({ account: "0912345678", password: "wrong" });
      throw new Error("expected rejection");
    } catch (error) {
      expect(error.code).to.equal("INVALID_CREDENTIALS");
    }
  });

  it("allows one gender change and blocks another change for 30 days", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "email",
      destination: "gender@example.com",
    });
    const registered = await service.register({
      channel: "email",
      account: "gender@example.com",
      email: "gender@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    const changed = await service.updateGender(registered.user.id, {
      gender: "male",
    });
    expect(changed.gender).to.equal("male");
    expect(changed.gender_changed_at).to.be.instanceOf(Date);
    try {
      await service.updateGender(registered.user.id, { gender: "female" });
      throw new Error("expected cooldown");
    } catch (error) {
      expect(error.code).to.equal("GENDER_CHANGE_COOLDOWN");
    }
  });
  it("updates a valid adult birthdate and rejects an underage date", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "email",
      destination: "birthday@example.com",
    });
    const registered = await service.register({
      channel: "email",
      account: "birthday@example.com",
      email: "birthday@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    const changed = await service.updateBirthdate(registered.user.id, {
      birthdate: "1997-06-21",
    });
    expect(changed.birthdate).to.equal("1997-06-21");
    const underage = new Date();
    underage.setUTCFullYear(underage.getUTCFullYear() - 10);
    try {
      await service.updateBirthdate(registered.user.id, {
        birthdate: underage.toISOString().slice(0, 10),
      });
      throw new Error("expected age restriction");
    } catch (error) {
      expect(error.code).to.equal("BIRTHDATE_AGE_RESTRICTED");
    }
  });
  it("persists a GPS location and its update time", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "email",
      destination: "location@example.com",
    });
    const registered = await service.register({
      channel: "email",
      account: "location@example.com",
      email: "location@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    const result = await service.updateLocation(registered.user.id, {
      latitude: 25.033,
      longitude: 121.5654,
      accuracyMeters: 15,
      city: "台北市",
    });
    expect(result.city).to.equal("台北市");
    expect(result.locationUpdatedAt).to.be.instanceOf(Date);
  });
  it("persists normalized custom tags and interests and rejects contact details", async () => {
    const service = new AuthService(new MemoryUsers());
    const verification = await service.requestCode({
      channel: "email",
      destination: "options@example.com",
    });
    const registered = await service.register({
      channel: "email",
      account: "options@example.com",
      email: "options@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    const updated = await service.updateCustomOptions(registered.user.id, {
      name: "Mina",
      image: "moon-cat",
      location: "臺北市",
      headline: "慢慢認識",
      bio: "喜歡真誠交流",
      tags: ["night-owl"],
      interests: ["coffee"],
      custom_tags: ["  夜間散步  "],
      custom_interests: ["手沖咖啡"],
      zodiac: "libra",
      relationship: "single",
      looking_for: "friends-first",
    });
    expect(updated.tags).to.deep.equal(["night-owl"]);
    expect(updated.custom_tags).to.deep.equal(["夜間散步"]);
    expect(
      (await service.me(registered.user.id)).custom_interests,
    ).to.deep.equal(["手沖咖啡"]);
    try {
      await service.updateCustomOptions(registered.user.id, {
        name: "Mina",
        image: "moon-cat",
        location: "",
        headline: "",
        bio: "",
        tags: [],
        interests: [],
        custom_tags: ["IG: someone"],
        custom_interests: [],
        zodiac: "",
        relationship: "",
        looking_for: "",
      });
      throw new Error("expected validation error");
    } catch (error) {
      expect(error.code).to.equal("INVALID_CUSTOM_OPTION");
    }
  });
  it("requires the current password before permanently deleting an account", async () => {
    const users = new MemoryUsers();
    const service = new AuthService(users);
    const verification = await service.requestCode({
      channel: "email",
      destination: "delete@example.com",
    });
    const registered = await service.register({
      channel: "email",
      account: "delete@example.com",
      email: "delete@example.com",
      phone: "",
      password: "Password123",
      verificationCode: verification.developmentCode,
      birthdate: "1996-05-20",
      gender: "female",
    });
    try {
      await service.deleteAccount(registered.user.id, { password: "wrong" });
      throw new Error("expected rejection");
    } catch (error) {
      expect(error.code).to.equal("INVALID_CREDENTIALS");
    }
    expect(
      await service.deleteAccount(registered.user.id, {
        password: "Password123",
      }),
    ).to.deep.equal({ deleted: true });
    expect(await users.getUserById(registered.user.id)).to.equal(null);
  });
});

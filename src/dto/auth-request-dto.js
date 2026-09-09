import Joi from "joi";

const password = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required();

export const loginDto = Joi.object({
  account: Joi.string().trim().min(3).max(100).required(),
  password: Joi.string().required(),
});

export const verificationRequestDto = Joi.object({
  channel: Joi.string().valid("phone", "email").required(),
  destination: Joi.alternatives().conditional("channel", {
    is: "email",
    then: Joi.string().email().required(),
    otherwise: Joi.string()
      .pattern(/^09\d{8}$/)
      .required(),
  }),
});

export const registerDto = Joi.object({
  channel: Joi.string().valid("phone", "email").required(),
  account: Joi.string().trim().min(3).max(100).required(),
  phone: Joi.string()
    .allow("")
    .pattern(/^09\d{8}$/),
  email: Joi.string().allow("").email(),
  password,
  verificationCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  birthdate: Joi.date().iso().max("now").required(),
  gender: Joi.string().valid("male", "female").required(),
});

export const genderUpdateDto = Joi.object({
  gender: Joi.string().valid("male", "female").required(),
});

export const accountDeleteDto = Joi.object({
  password: Joi.string().min(1).max(200).required(),
});

export const birthdateUpdateDto = Joi.object({
  birthdate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});

export const locationUpdateDto = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  accuracyMeters: Joi.number().min(0).max(100000).allow(null).required(),
  city: Joi.string().trim().max(50).allow("").required(),
});

export const customOptionsUpdateDto = Joi.object({
  name: Joi.string().trim().min(1).max(20).required(),
  image: Joi.string().trim().max(255).required(),
  location: Joi.string().trim().max(100).allow("").required(),
  headline: Joi.string().trim().max(100).allow("").required(),
  bio: Joi.string().trim().max(200).allow("").required(),
  tags: Joi.array().items(Joi.string()).max(5).required(),
  interests: Joi.array().items(Joi.string()).max(8).required(),
  custom_tags: Joi.array().items(Joi.string()).max(2).required(),
  custom_interests: Joi.array().items(Joi.string()).max(2).required(),
  zodiac: Joi.string()
    .valid(
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    )
    .allow("")
    .required(),
  relationship: Joi.string()
    .valid("single", "in-relationship", "open", "divorced", "private")
    .allow("")
    .required(),
  looking_for: Joi.string()
    .valid(
      "sincere-people",
      "chatty-friends",
      "serious-dating",
      "sports-buddy",
      "travel-buddy",
      "food-buddy",
      "friends-first",
    )
    .allow("")
    .required(),
});

import joi from "joi";

const userinputvalidation = (data) => {
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    phonenumber: joi.string().required(),
    nextofkinname: joi.string(),
    nextofkinphonenumber: joi.string()
  });
  return schema.validate(data);
};

export { userinputvalidation };

const bcrypt = require("bcrypt");

const encrypt = async (password) => {
  // Gerar um salt (valor aleatório)
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  // Hash da senha com o salt
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

const comparePasswords = async (password, hashedPassword) => {
  // Comparar a senha fornecida com o hash armazenado
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

module.exports = {
  encrypt,
  comparePasswords
};

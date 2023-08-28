const verifySignUpForm = (username, password) => {
  let errors = {};
  if (username.length <= 0) {
    errors.username = "Le champ username est obligatoire";
  }
  if (password.length <= 0) {
    errors.password = "le champ mot de passe est obligatoire";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

export { verifySignUpForm };

exports.credit = async (userId, amount) => {
  console.log(`Credit ${amount} to user ${userId}`);
  return { userId, amount };
};

exports.debit = async (userId, amount) => {
  console.log(`Debit ${amount} from user ${userId}`);
  return { userId, amount };
};

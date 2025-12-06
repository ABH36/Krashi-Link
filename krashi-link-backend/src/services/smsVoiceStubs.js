exports.sendVoice = async (to, message) => {
  console.log(`Simulating voice: ${to} -> ${message}`);
  return true;
};

exports.stubSms = async (to, message) => {
  console.log(`Simulate SMS: ${to} -> ${message}`);
  return true;
};

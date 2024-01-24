export default function generatePassword(): string {

  const chars = ['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

  const newPassword: string[] = [];

  for (let i = 0 ; i < 8 ; i++){
    newPassword.push(chars[Math.floor(Math.random() * (chars.length - 1 - 0 + 1)) + 0])
  }

  return newPassword.join('');
}

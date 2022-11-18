import JSEncrypt from 'jsencrypt';

export const doEncrypt = (publicKey: string, keyPassword: string) : string | false => {
    console.log(JSEncrypt)
    let encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    return encryptor.encrypt(keyPassword)
}

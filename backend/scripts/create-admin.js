// Crea (o rota la contraseña de) el usuario administrador inicial.
//
// Sustituye al INSERT que antes vivía en database/schema.sql. Ese INSERT traía una
// contraseña fija versionada en git, lo que convertía al administrador en una
// credencial pública para cualquiera con acceso al repositorio o a su historial.
//
// Uso, desde backend/:
//     npm run create-admin
//     ADMIN_PASSWORD='...' ADMIN_EMAIL='...' npm run create-admin
//
// Si ADMIN_PASSWORD no está definida, se genera una contraseña aleatoria fuerte y se
// imprime una única vez en la terminal. El texto plano nunca se escribe en un archivo,
// ni en la base, ni en los logs.

require('dotenv').config();
const crypto = require('crypto');
const pool = require('../src/config/db');
const { hashPassword } = require('../src/utils/password');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@barbermanager.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Kenneth Rodríguez';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '6406-3210';

function generatePassword() {
  // Sin caracteres ambiguos ni delimitadores que haya que escapear al copiar.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(24);
  let password = '';
  for (const byte of bytes) {
    password += alphabet[byte % alphabet.length];
  }
  return password;
}

async function main() {
  const existing = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [
    ADMIN_EMAIL,
  ]);
  const userExists = existing[0].length > 0;

  const providedPassword = process.env.ADMIN_PASSWORD;
  if (userExists && !providedPassword) {
    console.error(
      `Ya existe un usuario con el correo ${ADMIN_EMAIL}.\n` +
        'Para rotar su contraseña, define ADMIN_PASSWORD y vuelve a ejecutar el comando.\n' +
        'Si solo querías crear el administrador inicial, cambia ADMIN_EMAIL por uno libre.'
    );
    process.exitCode = 1;
    return;
  }

  const password = providedPassword || generatePassword();
  const passwordHash = await hashPassword(password);

  await pool.query(
    `INSERT INTO usuarios (nombre, telefono, email, password_hash, rol)
     VALUES (?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre),
                             telefono = VALUES(telefono),
                             password_hash = VALUES(password_hash),
                             rol = 'admin',
                             activo = 1`,
    [ADMIN_NAME, ADMIN_PHONE, ADMIN_EMAIL, passwordHash]
  );

  console.log('');
  console.log('  Administrador listo.');
  console.log(`  Correo:  ${ADMIN_EMAIL}`);
  if (!providedPassword) {
    console.log(`  Contraseña:  ${password}`);
    console.log('  Se muestra una sola vez. Guardala ahora; no se puede recuperar.');
  } else {
    console.log('  Contraseña:  (la que definiste en ADMIN_PASSWORD)');
  }
  console.log('');
  console.log('  Si esta base de datos se creó con el seed anterior, recuerda rotar la');
  console.log('  contraseña anterior: ese hash sigue siendo válido en la base aunque ya');
  console.log('  no esté en el repositorio.');
  console.log('');
}

main()
  .then(() => pool.end())
  .catch((error) => {
    console.error('No se pudo crear el administrador:', error.message);
    process.exitCode = 1;
    return pool.end();
  });
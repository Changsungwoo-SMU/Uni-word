const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // 최대 연결 수 (환경에 맞게 조정 가능)
    queueLimit: 0
});

// 연결 테스트 (앱 실행 시 최초 1회 확인용)
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release(); // 사용 후에는 반드시 풀에 반환해야 합니다.
    })
    .catch(err => {
        console.error('❌ MySQL Database Connection Failed:');
        console.error(err.message);
    });

module.exports = pool;
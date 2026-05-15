-- ================================================================
-- Uni-Word MVP Database Schema
-- V2be · 소프트웨어공학 팀프로젝트
-- 실행 방법: mysql -u root -p < schema.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS uniword;
USE uniword;

-- ----------------------------------------------------------------
-- users: 회원 정보 (PBI-1 · 사용자 인증)
-- ----------------------------------------------------------------
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255)          NOT NULL UNIQUE,
  password   VARCHAR(255)          NOT NULL,
  name       VARCHAR(100)          NOT NULL,
  role       ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- words: 토익 단어 데이터 (PBI-2 · DB 구축 / PBI-3 · CRUD)
-- ----------------------------------------------------------------
CREATE TABLE words (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  word       VARCHAR(100) NOT NULL,  -- 영단어
  mean       VARCHAR(255) NOT NULL,  -- 한국어 뜻
  pos        VARCHAR(50),            -- 품사 (noun, verb 등)
  level      INT          DEFAULT 1, -- 난이도 (1: 초급, 2: 중급, 3: 고급)
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  example_en TEXT,
  example_ko TEXT
);

-- ----------------------------------------------------------------
-- test_results: 테스트 회차별 결과 (PBI-4 · 테스트 모듈)
-- ----------------------------------------------------------------
CREATE TABLE test_results (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT   NOT NULL,  -- 어떤 유저의 테스트인지
  total_count   INT   NOT NULL,  -- 전체 문제 수
  correct_count INT   NOT NULL,  -- 맞은 문제 수
  score         FLOAT NOT NULL,  -- 점수 (%)
  taken_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------
-- test_answers: 문항별 정오답 (PBI-4 · 테스트 모듈)
-- ----------------------------------------------------------------
CREATE TABLE test_answers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  test_result_id INT          NOT NULL,  -- 어떤 테스트 회차인지
  word_id        INT          NOT NULL,  -- 어떤 단어 문제인지
  user_answer    VARCHAR(100),           -- 사용자가 입력한 답
  is_correct     BOOLEAN      NOT NULL,  -- 정답 여부
  FOREIGN KEY (test_result_id) REFERENCES test_results(id),
  FOREIGN KEY (word_id)        REFERENCES words(id)
);
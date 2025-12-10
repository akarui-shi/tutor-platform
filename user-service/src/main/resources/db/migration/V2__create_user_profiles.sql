CREATE TABLE student_profiles (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                  grade_level VARCHAR(50),
                                  learning_goals TEXT,
                                  preferences TEXT,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tutor_profiles (
                                id BIGSERIAL PRIMARY KEY,
                                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                specialization VARCHAR(255),
                                education TEXT,
                                experience_years INTEGER,
                                hourly_rate DECIMAL(10,2),
                                rating DECIMAL(3,2) DEFAULT 0.0,
                                description TEXT,
                                is_verified BOOLEAN DEFAULT false,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_tutor_profiles_user_id ON tutor_profiles(user_id);
-- Добавляем колонку username, если её нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(255);
        -- Создаем уникальный индекс после заполнения данных
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
    END IF;
END $$;

-- Добавляем колонку full_name
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    END IF;
END $$;

-- Если username пустой, заполняем из email
UPDATE users SET username = email WHERE username IS NULL OR username = '';

-- Если full_name пустой, заполняем из first_name и last_name
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name) 
WHERE (full_name IS NULL OR full_name = '') AND first_name IS NOT NULL AND last_name IS NOT NULL;


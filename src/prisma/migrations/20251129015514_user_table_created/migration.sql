-- CreateTable
CREATE TABLE "Users" (
    "uuid" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "pasword_hash" VARCHAR(2040) NOT NULL,
    "provider" VARCHAR(255) NOT NULL DEFAULT 'Local',
    "pid" TEXT,
    "displayName" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "photoURL" VARCHAR(2024),
    "photo" BYTEA,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "SQNotes" (
    "notekey" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "body" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SQNotes_pkey" PRIMARY KEY ("notekey")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_pid_key" ON "Users"("pid");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session"("expire");

-- CreateEnum
CREATE TYPE "ScheduleTypeType" AS ENUM ('NOTIFY_EVERY', 'NOTIFY_AT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fact" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "description" TEXT NOT NULL DEFAULT E'',
    "deadline" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "ownerId" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "type" "ScheduleTypeType" NOT NULL DEFAULT E'NOTIFY_EVERY',
    "scheduleParameters" JSONB DEFAULT '{"interval":10,"notifyTimes":["08:00:00+00:00","12:00:00+00:00","16:00:00+00:00"],"dayOfWeek":[true,true,true,true,true,true,true]}',
    "ownerId" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Fact_schedules" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_Fact_tags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_Fact_schedules_AB_unique" ON "_Fact_schedules"("A", "B");

-- CreateIndex
CREATE INDEX "_Fact_schedules_B_index" ON "_Fact_schedules"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Fact_tags_AB_unique" ON "_Fact_tags"("A", "B");

-- CreateIndex
CREATE INDEX "_Fact_tags_B_index" ON "_Fact_tags"("B");

-- AddForeignKey
ALTER TABLE "_Fact_schedules" ADD FOREIGN KEY ("A") REFERENCES "Fact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Fact_schedules" ADD FOREIGN KEY ("B") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Fact_tags" ADD FOREIGN KEY ("A") REFERENCES "Fact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Fact_tags" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { faker } from "@faker-js/faker";

// Seed faker to make results consistent
faker.seed(456);

// Mock Tables
export const mockTables = [
  {
    id: faker.string.uuid(),
    name: "users",
    description: "Stores user accounts and profile information",
    createdAt: faker.date.past().toISOString(),
    columns: [
      {
        name: "id",
        type: "uuid",
        required: true,
        unique: true,
        isPrimary: true,
        isIndex: true,
      },
      {
        name: "email",
        type: "string",
        required: true,
        unique: true,
        isPrimary: false,
        isIndex: true,
      },
      {
        name: "name",
        type: "string",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
      {
        name: "password",
        type: "string",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
      {
        name: "created_at",
        type: "datetime",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
      },
      {
        name: "updated_at",
        type: "datetime",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
    ],
    indexes: [
      {
        name: "idx_users_email",
        columns: ["email"],
        isUnique: true,
      },
    ],
  },
  {
    id: faker.string.uuid(),
    name: "posts",
    description: "Stores blog posts written by users",
    createdAt: faker.date.past().toISOString(),
    columns: [
      {
        name: "id",
        type: "uuid",
        required: true,
        unique: true,
        isPrimary: true,
        isIndex: true,
      },
      {
        name: "user_id",
        type: "uuid",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
        foreignKey: {
          table: "users",
          column: "id",
        },
      },
      {
        name: "title",
        type: "string",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
      },
      {
        name: "content",
        type: "text",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
      {
        name: "created_at",
        type: "datetime",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
      },
      {
        name: "updated_at",
        type: "datetime",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
    ],
    indexes: [
      {
        name: "idx_posts_user_id",
        columns: ["user_id"],
        isUnique: false,
      },
      {
        name: "idx_posts_title",
        columns: ["title"],
        isUnique: false,
      },
    ],
  },
  {
    id: faker.string.uuid(),
    name: "comments",
    description: "Stores comments on blog posts",
    createdAt: faker.date.past().toISOString(),
    columns: [
      {
        name: "id",
        type: "uuid",
        required: true,
        unique: true,
        isPrimary: true,
        isIndex: true,
      },
      {
        name: "post_id",
        type: "uuid",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
        foreignKey: {
          table: "posts",
          column: "id",
        },
      },
      {
        name: "user_id",
        type: "uuid",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
        foreignKey: {
          table: "users",
          column: "id",
        },
      },
      {
        name: "content",
        type: "text",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: false,
      },
      {
        name: "created_at",
        type: "datetime",
        required: true,
        unique: false,
        isPrimary: false,
        isIndex: true,
      },
    ],
    indexes: [
      {
        name: "idx_comments_post_id",
        columns: ["post_id"],
        isUnique: false,
      },
    ],
  },
];

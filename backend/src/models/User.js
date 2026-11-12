import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, ROLE_VALUES, USER_STATUSES } from "../constants/index.js";

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: null } },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, maxlength: 100, default: null },
    phone: { type: String, trim: true, maxlength: 30, default: null },
    city: { type: String, trim: true, maxlength: 100, default: null },
    postalCode: { type: String, trim: true, maxlength: 20, default: null },
    street: { type: String, trim: true, maxlength: 250, default: null },
    country: { type: String, trim: true, maxlength: 100, default: "България" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Имейлът е задължителен"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    firstName: { type: String, trim: true, maxlength: 50, default: null },
    lastName: { type: String, trim: true, maxlength: 50, default: null },
    phone: { type: String, trim: true, maxlength: 30, default: null },
    avatar: { type: imageSchema, default: null },
    address: { type: addressSchema, default: () => ({}) },

    // ===== Роли: поддържат се и role, и булеви флагове admin / superAdmin =====
    role: { type: String, enum: ROLE_VALUES, default: ROLES.USER, index: true },
    admin: { type: Boolean, default: false },
    superAdmin: { type: Boolean, default: false },

    status: { type: String, enum: USER_STATUSES, default: "pending", index: true },

    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordChangedAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },

    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null, select: false },

    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.lastLoginIp;
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  },
);

userSchema.index({ createdAt: -1 });

userSchema.virtual("fullName").get(function fullName() {
  return [this.firstName, this.lastName].filter(Boolean).join(" ") || this.email;
});

userSchema.virtual("isAdmin").get(function isAdminVirtual() {
  return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
});

userSchema.virtual("isSuperAdmin").get(function isSuperAdminVirtual() {
  return this.role === ROLES.SUPER_ADMIN;
});

// ===== Синхронизация role <-> флагове =====
// Ако е променено role -> флаговете се изчисляват от него.
// Ако са променени само флаговете -> role се изчислява от тях.
userSchema.pre("validate", function syncRoles(next) {
  const roleChanged = this.isModified("role") && !this.$isDefault("role");
  const flagsChanged = this.isModified("admin") || this.isModified("superAdmin");

  if (!roleChanged && flagsChanged) {
    if (this.superAdmin) this.role = ROLES.SUPER_ADMIN;
    else if (this.admin) this.role = ROLES.ADMIN;
    else this.role = ROLES.USER;
  }

  this.superAdmin = this.role === ROLES.SUPER_ADMIN;
  this.admin = this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
  next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // При нов акаунт не маркираме смяна на парола (иначе първият токен би бил невалиден)
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isAccountLocked = function isAccountLocked() {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

// "pending" (непотвърден имейл) също може да пазарува
userSchema.methods.canLogin = function canLogin() {
  return !this.deleted && ["active", "pending"].includes(this.status);
};

const User = mongoose.model("User", userSchema);
export default User;

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id?: string;
  username: string;
  email: string;
  password: string;
  //New fields
  homeCity?: string;
  useGPS?: boolean;
  morningAlert?: boolean;
  eveningAlert?: boolean;
  alertOnSuddenChange?: boolean;
  //
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Users extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  // --- NEW FIELDS ---
  public homeCity!: string;
  public useGPS!: boolean;
  public morningAlert!: boolean;
  public eveningAlert!: boolean;
  public alertOnSuddenChange!: boolean;
  //
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // --- NEW FIELDS ---
    homeCity: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    useGPS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    morningAlert: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    eveningAlert: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    alertOnSuddenChange: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: 'Users',
  },
);

export default Users;
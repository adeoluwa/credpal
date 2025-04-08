import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '../ormconfig';

const AppDataSource = new DataSource(config);

// Test the connection immediately

export default AppDataSource;

import { IUser } from '../model';

declare global {
	namespace Express {
		interface User extends IUser {}
	}
}

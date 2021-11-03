import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
// import User from '';

// Mock Data
const User = {
	findOne: ({ loginId }) => {
		return {
			exec: async () => {
				return {
					id: '1234',
					loginId,
					password: '$2b$10$HXWgJY9wgh11rh6z4PFZn.I7bfoCZgP0.hG5/Y2pUabZitwY7z6x2',
					directoryId: '123123',
					maxCapacity: 1024 * 1024 * 1024,
					currentCapacity: 1024 * 1024,
				};
			},
		};
	}
};

const localLoginStrategy = new LocalStrategy(
	{
		usernameField: 'id',
		passwordField: 'password',
		session: true,
		passReqToCallback: false,
	},
	async (id, password, done) => {
		try {
			const user = await User.findOne({ loginId: id }).exec();
			
			if (!user) {
				return done(null, false, { message: 'wrong loginId' });
			}
			
			if (bcrypt.compareSync(password, user.password)) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'wrong password' });
			}
		} catch (err) {
			return done(err);
		}
	}
);


export default () => {
	passport.serializeUser((user, done) => {
		console.log('ser', user);
		done(null, user);
	});

	passport.deserializeUser((user: any, done) => {
		console.log('deser', user);
		done(null, user);
	});

	passport.use('local-login', localLoginStrategy);
};

import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
// import User from '';

// Mock Data
const User = {
	findOne: async ({ loginId }) => {
		return {
			_id: '1234',
			loginId,
			password: 'abcdeeefas',
			directoryId: '123123',
			maxCapacity: 1024 * 1024 * 1024,
			currentCapacity: 1024 * 1024,
		};
	},
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
			const user = await User.findOne({ loginId: id });

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
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	passport.use('local-login', localLoginStrategy);
};

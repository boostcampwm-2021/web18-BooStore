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
					_id: '1234',
					loginId,
					password: 'abcdeeefas',
					directoryId: '123123',
					maxCapacity: 1024 * 1024 * 1024,
					currentCapacity: 1024 * 1024,
				};
			},
		};
	},
	create: async ({ loginId, password, maxCapacity, currentCapacity }) => {
		return true;
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

const localSignupStrategy = new LocalStrategy(
	{
		usernameField: 'id',
		passwordField: 'password',
		session: false,
		passReqToCallback: false,
	},
	async (id, password, done) => {
		try {
			const user = await User.findOne({ loginId: id }).exec();

			if (user) {
				return done(null, false, { message: 'loginId already exists.' });
			}

			const salt = bcrypt.genSaltSync(10);
			const encryptPassword = bcrypt.hashSync(password, salt);
			await User.create({
				loginId: id,
				password: encryptPassword,
				maxCapacity: 1024 * 1024 * 1024,
				currentCapacity: 0,
			});

			return done(null, false);
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
	passport.use('local-signup', localSignupStrategy);
};

import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { User } from '../model';

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
		done(null, user);
	});

	passport.deserializeUser((user: any, done) => {
		done(null, user);
	});

	passport.use('local-login', localLoginStrategy);
};

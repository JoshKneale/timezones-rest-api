import {User} from '../types/user';

export const DBrefreshTokens: string[] = [];
export const DBusers: User[] = [
  {
    id: '29bf1ef5-cabb-497a-9985-95b03b3c0d54',
    email: 'admin@test.com',
    password:
      'd6efe6b8000e17d009f0fc46b6522f71bd5a85b27961062cd65ec558015580049fed205909ccf2bd942ff88c0445290425887bf5b187833aa209ae3c96f134f7',
    salt: '9bf96dd4d804ed600f4235b8696a8695',
    admin: true,
  },
];
export const DBuserTimezones: Record<string, Set<string>> = {
  '29bf1ef5-cabb-497a-9985-95b03b3c0d54': new Set(['Pacific/Norfolk', 'Europe/Lisbon', 'Europe/Athens']),
};

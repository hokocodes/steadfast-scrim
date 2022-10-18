import { UserRepository } from '../repo/user-repository';
import { initScrimService } from '../scrim-service';
import { mockDeep } from 'jest-mock-extended';
import { chance } from '../../lib/chance';
import { Role, User, userSchema } from '../../entities/user';
import { ScrimRepository } from '../repo/scrim-repository';
import { initMatchmakingService } from '../matchmaking-service';
import { Scrim } from '../../entities/scrim';
import { DiscordService } from '../discord-service';

describe('ScrimService', () => {
  const scrimRepository = mockDeep<ScrimRepository>();
  const userRepository = mockDeep<UserRepository>();
  const discord = mockDeep<DiscordService>();
  const matchmakingService = initMatchmakingService();
  const scrimService = initScrimService(scrimRepository, userRepository, matchmakingService, discord);

  it('Creates a valid scouting link', async () => {
    const mockGetUsersResult: User[] = [...new Array(5)].map(() =>
      userSchema.parse({
        id: chance.guid(),
        leagueIGN: chance.first(),
        rank: 'IRON',
        region: 'EUW',
        main: 'JUNGLE',
        secondary: 'MID'
      })
    );
    const summoners = mockGetUsersResult.map((user) => user.leagueIGN).join(',');
    const expected = `https://u.gg/multisearch?summoners=${summoners}&region=euw1`;
    await expect(scrimService.generateScoutingLink(mockGetUsersResult)).toEqual(expected);
  });

  it('Gives the correct elo to winners/losers', async () => {
    const matchup = matchmakingService.startMatchmaking(twoOfEach)[0];
    const players = matchmakingService.matchupToPlayers(matchup, twoOfEach);
    const scrim: Scrim = {
      id: chance.integer(),
      winner: undefined,
      status: 'STARTED',
      voiceIDs: [],
      players: players
    };

    userRepository.getUsers.mockResolvedValueOnce([...twoOfEach]);
    userRepository.updateUserWithResult.mockResolvedValueOnce(10)
    scrimRepository.updateScrim.mockResolvedValueOnce(scrim)
    const what = await scrimService.reportWinner(scrim, 'BLUE');
    expect(what).toBe(true);
  });
});
const createTestUser = (role?: Role, secondary?: Role, name?: string, elo?: number) =>
  userSchema.parse({
    id: chance.guid(),
    leagueIGN: name || chance.name(),
    rank: 'GOLD',
    region: 'EUW',
    main: role,
    secondary: secondary ? secondary : secondary == 'MID' ? 'SUPPORT' : 'MID',
    elo: elo,
    wins: 0,
    losses: 0
  });

const twoOfEach: User[] = [
  createTestUser('TOP', 'MID', 'huzzle', 2100),
  createTestUser('MID', 'TOP', 'zero', 1400),
  createTestUser('TOP', 'JUNGLE', 'rayann', 1821),
  createTestUser('JUNGLE', 'JUNGLE', 'mika', 2400),
  createTestUser('BOT', 'JUNGLE', 'mo', 2400),
  createTestUser('SUPPORT', 'BOT', 'zironic', 659),
  createTestUser('JUNGLE', 'BOT', 'kharann', 1700),
  createTestUser('MID', 'BOT', 'yyaen', 1657),
  createTestUser('BOT', 'BOT', 'z', 1900),
  createTestUser('SUPPORT', 'BOT', 'tikka', 1800)
];

import apiClient from '../plugins/twurple.plugin.ts'

import { useDateTimeUtil } from '../../lib/utils/date.util.ts'
import { useStringUtil } from '../../lib/utils/string.util.ts'

const STRING = useStringUtil()
const DATE = useDateTimeUtil()

//#region @getters
async function onGame(payload: { channel: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  const channel = await apiClient.channels.getChannelInfoById(user.id)
  if (!channel) throw new Error(`Get channel info by user ID ${user.id} has failed.`)

  return `The current stream category is set to: ${channel.gameName}.`
}

async function onShoutout(payload: { channel: string; argument: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(payload.argument.trim())
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  const channel = await apiClient.channels.getChannelInfoById(user.id)
  if (!channel) throw new Error(`Get channel info by user id ${user.id} has failed.`)

  return channel.gameName
    ? `Check out @${user.name} over at https://twitch.tv/${user.name}! They were last seen playing ${channel.gameName}.`
    : `Check out @${user.name} over at https://twitch.tv/${user.name}!`
}

async function onTags(payload: { channel: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  const channel = await apiClient.channels.getChannelInfoById(user.id)
  if (!channel) throw new Error(`Get channel info by user ID ${user.id} has failed.`)

  return `The current stream tags are set to: ${channel.tags.join(', ')}`
}

async function onTitle(payload: { channel: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  const channel = await apiClient.channels.getChannelInfoById(user.id)
  if (!channel) throw new Error(`Get channel info by user ID ${user.id} has failed.`)

  return `The current stream title is set to: ${channel.title}.`
}

async function onUptime(payload: { channel: string }): Promise<string> {
  const stream = await apiClient.streams.getStreamByUserName(STRING.dehash(payload.channel))
  if (!stream) throw new Error(`Get stream by username ${payload.channel} has failed`)

  const uptime = DATE.formatMilliseconds(Date.now() - stream.startDate.getTime())
  return `The stream has been live for ${uptime}.`
}
//#endregion

//#region @setters
async function onSetGame(payload: { channel: string; argument: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  const game = await apiClient.games.getGameByName(payload.argument.trim())
  if (!game) throw new Error(`Get game by name ${payload.argument.trim()} has failed`)

  return apiClient.channels
    .updateChannelInfo(user.id, { gameId: game.id })
    .then(() => `The stream game has been updated to: ${game.name}.`)
}

async function onSetTitle(payload: { channel: string; argument: string }): Promise<string> {
  const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
  if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

  return apiClient.channels
    .updateChannelInfo(user.id, { title: payload.argument.trim() })
    .then(() => `The stream title has been updated to: ${payload.argument.trim()}.`)
}
//#endregion

export { onGame, onShoutout, onTags, onTitle, onUptime, onSetGame, onSetTitle }

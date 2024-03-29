import moment from 'moment'

import apiClient from '../../plugins/twurple.plugin.ts'
import { regExpIDExtract } from '../../lib/constants/regex.constants.ts'
import { useStringUtil } from '../../lib/utils/string.util.ts'
import APIService from '../../apis/index.ts'

const STRING = useStringUtil()

class QuoteActions {
  public static async onAddQuote(payload: { channel: string; argument: string }): Promise<string> {
    const user = await apiClient.users.getUserByName(STRING.dehash(payload.channel))
    if (!user) throw new Error(`Get user by name ${payload.channel} has failed.`)

    const channel = await apiClient.channels.getChannelInfoById(user.id)
    if (!channel) throw new Error(`Get channel info by user ID ${user.id} has failed.`)

    const { gameId, gameName } = channel
    if (!gameId || !gameName) throw new Error(`Get channel info by user ID ${user.id} has failed.`)

    const quote = await APIService.Localhost.Quote.createQuote({
      gameId,
      gameName,
      quote: payload.argument.trim()
    })

    return `Quote #${quote.$id} has been successfully added!`
  }

  public static async onQuote(payload?: { argument: string | undefined }): Promise<string> {
    if (payload?.argument) {
      const quoteId = parseInt(payload.argument)
      if (isNaN(quoteId)) throw new Error(`Argument ${payload.argument.trim()} could not be parsed into an integer.`)

      const quote = await APIService.Localhost.Quote.getQuote(quoteId)
      if (!quote) throw new Error(`Quote with id ${quoteId} could not be found`)

      return `Quote #${quote.$id}: ${moment(quote.$createdAt).format('l')} "${quote.quote}" [${quote.gameName}]`
    }

    const randomQuote = await APIService.Localhost.Quote.getRandomQuote()
    return `Quote #${randomQuote.$id}: ${moment(randomQuote?.$createdAt).format('l')} "${randomQuote?.quote}" [${
      randomQuote?.gameName
    }]`
  }

  public static async onEditQuote(payload: { argument: string }): Promise<string> {
    const regExp: RegExpMatchArray | null = payload.argument.trim().match(regExpIDExtract)
    if (!regExp) throw new Error('Regular expression match failed.')

    const [_match, id, edit] = regExp

    const $id = parseInt(id)
    if (isNaN($id)) throw new Error(`Could not parse ${id} into an integer.`)

    const quote = await APIService.Localhost.Quote.editQuote({ id: $id, quote: edit })
    return `Quote #${quote?.$id} has been successfully updated.`
  }

  public static async onDeleteQuote(payload: { argument: string }): Promise<string> {
    const id = parseInt(payload.argument.trim())
    if (isNaN(id)) throw new Error(`Could not parse arguement ${payload.argument.trim()} into an integer.`)

    await APIService.Localhost.Quote.deleteQuote(id)
    return `Quote #${id} has been successfully removed.`
  }
}

export default QuoteActions

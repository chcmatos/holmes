import { isNumber, requireNonNull } from './object-utils'

type TimeInfo = Date | number

/**
 * An object that contains information about difference between two Dates.
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, march 16 of 2022.
 * @author Carlos Matos
 */
export default class Duration {
  private _totalMilliss: number
  private _totalSec: number
  private _totalMin: number
  private _totalHour: number
  private _totalDay: number
  private _totalMonth: number
  private _totalYear: number
  private _milliss: number
  private _sec: number
  private _min: number
  private _hour: number
  private _day: number
  private _month: number
  private _year: number

  public readonly toString = (): string => this.toStringFull()

  public get totalMilliss(): number {
    return this._totalMilliss
  }

  public get totalSec(): number {
    return this._totalSec
  }

  public get totalMin(): number {
    return this._totalMin
  }

  public get totalHour(): number {
    return this._totalHour
  }

  public get totalDay(): number {
    return this._totalDay
  }

  public get totalMonth(): number {
    return this._totalMonth
  }

  public get totalYear(): number {
    return this._totalYear
  }

  public get milliss(): number {
    return this._milliss
  }

  public get sec(): number {
    return this._sec
  }

  public get min(): number {
    return this._min
  }

  public get hour(): number {
    return this._hour
  }

  public get day(): number {
    return this._day
  }

  public get month(): number {
    return this._month
  }

  public get year(): number {
    return this._year
  }

  constructor(oldTime: TimeInfo, newTime: TimeInfo = new Date()) {
    this._totalMilliss =
      Duration.parseToMillis(newTime) - Duration.parseToMillis(oldTime)
    this._totalSec    = ~~(this._totalMilliss / 1000)
    this._totalMin    = ~~(this._totalSec / 60)
    this._totalHour   = ~~(this._totalMin / 60)
    this._totalDay    = ~~(this._totalHour / 24)
    this._totalMonth  = ~~(this._totalDay / 30)
    this._totalYear   = ~~(this._totalMonth / 12)

    this._milliss = this._totalMilliss % 1000
    this._sec     = this._totalSec % 60
    this._min     = this._totalMin % 60
    this._hour    = this._totalHour % 24

    this._day     = (this._totalDay % 365) % 30
    this._month   = this._totalMonth % 12
    this._year    = this._totalYear
  }

  /**
   * Format sec to string
   * @param suffix: seconds suffix
   * @returns formatted value in 00s
   */
  public toStringTimeSec(suffix: string = 's'): string {
    return Duration.padZeroLeft(suffix, this.sec)
  }

  /**
   * Format min and sec to string
   * @param minSuffix minutes suffix
   * @param secSuffix seconds suffix
   * @param printZeroMin require to print zero minutes, default false.
   * @returns formatted value in 00Min00s, 00s
   */
  public toStringMinSec(
    minSuffix: string = 'Min',
    secSuffix: string = 's',
    printZeroMin: boolean = false,
  ): string {
    if (printZeroMin || this.min > 0) {
      return Duration.padZeroLeft(
        minSuffix + this.toStringTimeSec(secSuffix),
        this.min,
      )
    }
    return this.toStringTimeSec(secSuffix)
  }

  /**
   * Format hour, min and sec to string
   * @param hourSuffix hour suffix
   * @param minSuffix minutes suffix
   * @param secSuffix seconds suffix
   * @param printZeroHour require to print zero hour
   * @return formatted value in 00H00M00s, 00M00s or 00s
   */
  public toStringTime(
    hourSuffix: string = 'H',
    minSuffix: string = 'M',
    secSuffix: string = 's',
    printZeroHour: boolean = false,
  ): string {
    if (printZeroHour || this.hour > 0) {
      return Duration.padZeroLeft(
        hourSuffix + this.toStringMinSec(minSuffix, secSuffix, true),
        this.hour,
      )
    }
    return this.toStringMinSec(minSuffix, secSuffix)
  }

  /**
   * Format hour and min or min and sec or sec to string
   * @param hourSuffix hour suffix
   * @param minSuffix minutes suffix
   * @param secSuffix seconds suffix
   * @param printZeroHour require to print zero hour
   * @return formatted value in 00H00M, 00M00s or 00s
   */
  public toStringTimeShort(
    hourSuffix: string = 'H',
    minSuffix: string = 'M',
    secSuffix: string = 's',
    printZeroHour: boolean = false,
  ): string {
    if (printZeroHour || this.hour > 0) {
      return Duration.padZeroLeft(
        hourSuffix + Duration.padZeroLeft(minSuffix, this.min),
        this.hour,
      )
    }
    return this.toStringMinSec(minSuffix, secSuffix)
  }

  /**
   * Format hour, min and sec
   * @param hourSuffix hour suffix
   * @param minSuffix minutes suffix
   * @param secSuffix seconds suffix
   * @return formatted value in 00H00M00s
   */
  public toStringTimeFull(
    hourSuffix: string = 'H',
    minSuffix: string = 'M',
    secSuffix: string = 's',
  ): string {
    return this.toStringTime(hourSuffix, minSuffix, secSuffix, true)
  }

  /**
   * Format day, hour, min and sec
   * @param hourSuffix hour suffix
   * @param minSuffix minutes suffix
   * @param secSuffix seconds suffix
   * @return formatted value in 00D00H00M00s
   */
  public toStringFull(
    daySuffix: string = 'D',
    hourSuffix: string = 'H',
    minSuffix: string = 'M',
    secSuffix: string = 's',
  ): string {
    return Duration.padZeroLeft(
      daySuffix + this.toStringTime(hourSuffix, minSuffix, secSuffix, true),
      this.totalDay,
    )
  }

  /**
   * Print time.
   * @param log target console
   * @return formatted value in 00s
   */
  public printTimeSec(log: Console = console): void {
    log.info(this.toStringTimeSec())
  }

  /**
   * Print time.
   * @param log target console
   * @return formatted value in 00Min00s or 00s
   */
  public printTimeMinSec(log: Console = console): void {
    log.info(this.toStringMinSec())
  }

  /**
   * Print time.
   * @return formatted value in 00H00M00S, 00M00S or 00S
   */
  public printTime(log: Console = console): void {
    log.info(this.toStringTime())
  }

  /**
   * Print time short.
   * @return formatted value in 00H00Min, 00Min00S or 00S
   */
  public printTimeShort(log: Console = console): void {
    log.info(this.toStringTimeShort())
  }

  /**
   * Print time full.
   * @return formatted value in 00H00M00S
   */
  public printTimeFull(log: Console = console): void {
    log.info(this.toStringTimeFull())
  }

  /**
   * Print full duration.
   * @return formatted value in 00D00H00M00S
   */
  public printFull(log: Console = console): void {
    log.info(this.toStringFull())
  }

  private static padZeroLeft(
    suffix: string,
    value: number,
    maxLength: number = 2,
  ) {
    return value.toString().padStart(maxLength, '0') + suffix
  }

  private static parseToMillis(time: TimeInfo): number {
    requireNonNull(time, 'Input time data can not be null!')
    if (time instanceof Date) {
      return (<Date>time).getTime()
    } else if (isNumber(time)) {
      return <number>time
    } else {
      throw new Error('Type not solvable!')
    }
  }
}

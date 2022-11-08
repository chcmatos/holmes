export abstract class Entity {
  private _id: string
  private _createdAt: Date
  private _updatedAt?: Date

  get id(): string {
    return this._id
  }

  set id(id: string) {
    this._id = id.toString()
  }

  get createdAt(): Date {
    return this._createdAt
  }

  set createdAt(date: Date) {
    this._createdAt = date
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  set updatedAt(date: Date) {
    this._updatedAt = date
  }

  constructor() {
    this._createdAt = new Date()
  }
}

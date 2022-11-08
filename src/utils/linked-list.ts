import { IBiFunction, IConsumer, IFunction } from './functions'
import { equals, requireNonNull } from './object-utils'

/**
 * 🔗 A linked list is a linear collection of data elements whose order is not given by their physical placement in memory.
 * Instead, each element points to the next. It is a data structure consisting of a collection of nodes which together represent a sequence.
 * In its most basic form, each node contains: data, and a reference (in other words, a link) to the next node in the sequence.
 * This structure allows for efficient insertion or removal of elements from any position in the sequence during iteration.
 *
 * ![Linked List Image](https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Singly-linked-list.svg/408px-Singly-linked-list.svg.png)
 *
 * See more here https://en.wikipedia.org/wiki/Linked_list
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 22 of 2022.
 *
 * @author Carlos Matos
 */
class LinkedList<T> {
  private _root?: ListNode<T>
  private _curr?: ListNode<T>
  private _size: number = 0

  public readonly toString = (): string => this._root?.toString() ?? '[]'

  /**
   * Size of list
   */
  get size(): number {
    return this._size
  }

  /**
   * Root node element or null if empty list.
   */
  get root(): ListNode<T> {
    return this._root
  }

  constructor(root?: ListNode<T>) {
    this._root = root
  }

  /**
   * Add one node to the end of the linked list.
   * @param node new node
   * @returns current list
   */
  private pushNode(node: ListNode<T>): LinkedList<T> {
    if (this.includesNode(requireNonNull(node))) {
      throw new Error(
        'This node already is present in LinkedList, duplicated reference not allowed!',
      )
    } else if (!!!this._root) {
      this._curr = this._root = node
    } else {
      this._curr = this._curr.addNext(node)
    }
    this._size++
    return this
  }

  /**
   * Adds one or more elements to the end of an array and returns the current linked list.
   * @param data The element(s) to add to the end of the list.
   * @returns current list
   */
  public push(...data: T[] | ListNode<T>[]): LinkedList<T> {
    data.forEach((e: T | ListNode<T>) => {
      this.pushNode(e instanceof ListNode ? <ListNode<T>>e : new ListNode(e))
    })
    return this
  }

  /**
   * Adds one or more elements to the end of an array and returns the current linked list if this is matching the condition.
   * @param condition condition to do the add action
   * @param data The element(s) to add to the end of the list.
   * @returns current list
   */
  public pushIf(
    condition: boolean,
    ...data: T[] | ListNode<T>[]
  ): LinkedList<T> {
    return condition ? this.push(...data) : this
  }

  /**
   * removes the last element from an array and returns that element. This method changes the length of the array.
   * @returns The removed element from the list; `undefined` if the list is empty.
   */
  public pop(): T {
    if (!!this._curr) {
      let last = this._curr
      if (!!(this._curr = last.prev)) {
        last.prev.next = null
        last.prev = null
      } else {
        this._root = this._curr = undefined
      }
      this._size--
      return last.value
    }
    return undefined
  }

  /**
   * Removes the first element from an array and returns that removed element. This method changes the length of the array.
   * @returns The removed element from the list; `undefined` if the list is empty.
   */
  public shift(): T {
    if (!!this._root) {
      let first = this._root
      if (!!(this._root = first.next)) {
        this._root.prev = null
        first.next = null
      } else {
        this._root = this._curr = undefined
      }
      this._size--
      return first.value
    }
    return undefined
  }

  /**
   * Adds one or more elements to the beginning of the list.
   * @param data The element(s) to add to the begin of the list.
   * @returns current list
   */
  public unshift(...data: T[] | ListNode<T>[]): LinkedList<T> {
    if (this._size === 0) {
      return this.push(...data)
    } else {
      let other = new LinkedList<T>().push(...data)
      if (!!other.size) {
        other._curr.next = this._root
        this._root.prev = other._curr
        this._root = other._root
        other._curr = other._root = null
      }
    }
    return this
  }

  /**
   * Adds one or more elements to the beginning of the list if this is matching the condition.
   * @param condition condition to do the add action.
   * @param data The element(s) to add to the begin of the list.
   * @returns current list
   */
  public unshiftIf(
    condition: boolean,
    ...data: T[] | ListNode<T>[]
  ): LinkedList<T> {
    return condition ? this.unshift(...data) : this
  }
  /**
   * Clear list
   */
  public clear(): void {
    let aux = this._root
    if (!!aux) {
      this._root = this._curr = null
      do {
        if (!!aux.prev) {
          aux.prev.next = null
          aux.prev = null
        }
      } while (!!(aux = aux.next))
    }
  }

  /**
   * First element on list
   */
  public first(): T {
    return this._curr?.first()?.value
  }

  /**
   * Last element on list
   */
  public last(): T {
    return this._curr?.last()?.value
  }

  /**
   * Determines whether an array includes a certain value among its entries, returning true or false as appropriate.
   * @param data The value to search for.
   * @returns A boolean value which is `true` if the value `data` is found within the array
   * (or the part of the array indicated by the index fromIndex, if specified).
   */
  public includesNode(node: ListNode<T>): boolean {
    return !!this._root && this._root.exists(node)
  }

  /**
   * Determines whether a node of list includes a certain value among its entries, returning true or false as appropriate.
   * @param data The value to search for.
   * @returns A boolean value which is `true` if the value `data` is found within the array
   * (or the part of the array indicated by the index fromIndex, if specified).
   */
  public includes(data: T): boolean {
    return this.some((value: T) => equals(value, data))
  }

  /**
   * The some() method tests whether at least one element in the array passes the test implemented by the provided function. It returns true if, in the array, it finds an element for which the provided function returns true; otherwise it returns false. It doesn't modify the array.
   * @param fun A function to test for each element.
   * @returns `true` if the callback function returns a truthy value for at least one element in the array. Otherwise, `false`.
   */
  public some(fun: IFunction<T, boolean>): boolean {
    requireNonNull(fun, "Cllback function can't be null!")
    if (!!this._root) {
      let n = this._root
      do {
        if (fun(n.value)) {
          return true
        }
      } while (!!(n = n.next))
    }
    return false
  }

  /**
   * Tests whether all elements in the list pass the test implemented by the provided function.
   * It returns a Boolean value.
   * @param fun A function to test for each element, taking three arguments:
   * @returns `true` if the `fun` function returns a truthy value for every list element. Otherwise, `false`.
   */
  public every(fun: IFunction<T, boolean>): boolean {
    requireNonNull(fun, "Callback function can't be null!")
    if (!!this._root) {
      let n = this._root
      do {
        if (!fun(n.value)) {
          return false
        }
      } while (!!(n = n.next))
      return true
    }
    return false
  }

  /**
   * Creates a new array populated with the results of calling a provided function on every element in the calling array.
   * @param fun Function that is called for every element of list. Each time `fun` executes, the returned `value` is added to newArray.
   * @returns A new array with each element being the result of the callback function.
   */
  public map<OUT>(fun: IFunction<T, OUT>): OUT[] {
    requireNonNull(fun, "Callback function can't be null!")
    let arr = new Array<OUT>()
    if (!!this._root) {
      let n = this._root
      do {
        arr.push(fun(n.value))
      } while (!!(n = n.next))
    }
    return arr
  }

  /**
   * Executes a provided function once for each list element.
   * @param consumer Function to execute on each element
   */
  public forEach(consumer: IConsumer<T>): void {
    requireNonNull(consumer, "Callback consumer can't be null!")
    if (!!this._root) {
      let n = this._root
      do {
        consumer(n.value)
      } while (!!(n = n.next))
    }
  }

  /**
   * Executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element. The final result of running the reducer across all elements of the list is a single value.
   * The first time that the callback is run there is no "return value of the previous calculation". If supplied, an initial value may be used in its place. Otherwise the array element at index 0 is used as the initial value and iteration starts from the next element (index 1 instead of index 0).
   * @param fun A "reducer" function.
   * First input argument is the accumulated value, initial value or first element of list if not set.
   * Second input argument is the first element of list if initial value setup, otherwise will be the second index.
   * Each exection of callback must return the accumulated value
   * @returns return the accumulated value
   */
  public reduce<ACC>(
    fun: IBiFunction<ACC, T, ACC>,
    initialValue: ACC = undefined,
  ): ACC {
    requireNonNull(fun, "Callback function can't be null!")
    if (!!this._root) {
      let first = this._root
      if (initialValue === undefined) {
        initialValue = <ACC>(<unknown>first.value)
        first = first.next
      }
      do {
        initialValue = fun(initialValue, first.value)
      } while (!!(first = first.next))
    }
    return initialValue
  }

  /**
   * A shallow copy of list, changes linked nodes references
   * but keep the values references and original sequence.
   */
  public copy(): LinkedList<T> {
    return this.reduce((acc, curr) => acc.push(curr), new LinkedList<T>())
  }

  /**
   * Adds all the elements of an array into a string, separated by the specified separator string.
   * @param separator A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.
   */
  public join(separator?: string): string {
    return this.toArray().join(separator)
  }

  /**
   * Create a new linked list with reversed elements of current list.
   */
  public reverse(): LinkedList<T> {
    return this.reduce((acc, curr) => acc.unshift(curr), new LinkedList())
  }

  /**
   * Get current linked list content as array
   */
  public toArray(): T[] {
    const arr: T[] = []
    return this.reduce((acc, curr) => {
      acc.push(curr)
      return acc
    }, arr)
  }
}

/**
 * 🔗 Linked Node for usage with LinkedList or single as linked node.
 *
 * A linked node is an object data structure that contains a value
 * and links to the previous and next node. The set of nodes will works
 * how like a linear collection. It's possible to find any
 * value by any node reference on data structure.
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 22 of 2022.
 *
 * @author Carlos Matos
 * @see LinkedList
 */
class ListNode<T> {
  public readonly value?: T
  public prev?: ListNode<T>
  public next?: ListNode<T>

  public readonly toString = (): string => {
    return this.join()
  }

  /**
   * Value of node
   * @returns node value
   */
  public readonly valueOf = (): T => {
    return this.value
  }

  constructor(value?: T) {
    this.value = value
  }

  /**
   * Add a node as next node of current
   * @param node new node
   * @returns new node reference
   */
  public addNext(node: ListNode<T>): ListNode<T> {
    return ((requireNonNull(node).prev = this).next = node)
  }

  /**
   * Attempt to find first node on linked nodes
   * @returns first node
   */
  public first(): ListNode<T> {
    return !!this.prev ? this.prev.first() : this
  }

  /**
   * Attempt to find last node on linked nodes
   * @returns last node
   */
  public last(): ListNode<T> {
    return !!this.next ? this.next.last() : this
  }

  private findNodeEqualsOrByArgs(
    args: T | ListNode<T> | { value: T },
  ): boolean {
    return args instanceof ListNode
      ? this === args || equals(this.value, (<ListNode<T>>args).value)
      : equals(this.value, args) || equals(this.value, args['value'])
  }

  private findNode(
    args: T | ListNode<T> | { value: T },
    navigatePrev: boolean = true,
    navigateNext: boolean = true,
  ): ListNode<T> {
    let found: ListNode<T> = null
    if (this.findNodeEqualsOrByArgs(args)) {
      return this //found on current
    } else if (
      navigatePrev &&
      !!this.prev &&
      !!(found = this.prev.findNode(args, true, false))
    ) {
      return found //found on left
    } else if (
      navigateNext &&
      !!this.next &&
      !!(found = this.next.findNode(args, false, true))
    ) {
      return found //found on right
    } else {
      return found //not found
    }
  }

  /**
   * Attempt to find node or value inner linked node by
   * any node.
   * @param args target node or value
   * @returns node found or null if input argument is null or undefined
   */
  public find(args: T | ListNode<T> | { value: T }): ListNode<T> {
    return !!!args ? null : this.findNode(args)
  }

  /**
   * Check if node or node value exists on current linked nodes
   * @param args target node or value
   * @returns true, target node or node value exists, otherwise false
   */
  public exists(args: any): boolean {
    return !!this.find(args)
  }

  private join(): string {
    let n: ListNode<T> = this
    let arr: any[] = []
    do {
      arr.push(`[${n.value}]`)
    } while (!!(n = n.next))
    return arr.join('->')
  }

  /**
   * Print linked nodes
   */
  public print(): void {
    console.log(this.toString())
  }
}

export { LinkedList, ListNode }

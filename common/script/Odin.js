/**
 * The Odin module provides common tools for Roll20.
 */
var Odin = (function() {
	'use strict';

	/**
	 * The Collections class is an utility class with static methods to manage collections.
	 */
	class Collections {

		/**
		 * Gets the only object of the specified collection.
		 * @param collection The collection to watch.
		 * @return the only object of the collection or null if none or more than one.
		 */
		static only(collection) {
			return _.isUndefined(collection) || _.size(collection) === 0 || _.size(collection) > 1 ? null : _.first(collection);
		}

	}

	/**
	 * The Rankable class defines rankable object.
	 */
	class Rankable {

		/**
		 * @constructor
		 * @param name The name of the rankable object.
		 * @param rank The rank of the rankable object, from 1 to the lower priority.
		 */
		constructor(name, rank) {
			this.name = name;
			this.rank = rank;
		}

	}

	/**
	 * The Rankables class defines rankable objects. Name of the rankable objects are
	 * used for registration.
	 */
	class Rankables {

		/**
		 * @constructor
		 * @param name The name of the rankable object.
		 * @param rank The rank of the rankable object, from 1 to the lower priority.
		 */
		constructor(name, rank) {
			this.rankables = new Map();
		}

		/**
		 * Registers the specified rankable object.
		 * @param rankable The rankable object to register.
		 * @return the instance.
		 */
		withRankable(rankable) {
			this.rankables.set(rankable.name, rankable);
			return this;
		}

		/**
		 * Returns the rank of the specified object.
		 * @param name The name of the object for which to get the rank.
		 * @return the rank.
		 */
		rank(name) {
			const r = this.rankables.get(name);
			return r == null ? null : r.rank;
		}

	}

	/**
	 * The EventHandler class provices static methods to handle event.
	 */
	class EventHandler {

		/**
		 * Handles the api message.
		 * @param msg     The message to handle.
		 * @param process The static method which process the command.
		 * @param handler The object which handles the message processing.
		 */
		static async handleCommand(msg, process, handler) {
			if (msg.type != 'api') return;
			const args = msg.content.split(/\s+/);
			const cmd = args.shift().substring(1);
			process(cmd, args, handler);
		}

	}

	/**
	 * The Test class defines a test to register in a testsuite.
	 */
	class Test {

		/**
		 * @constructor
		 * @param name   The name of the test.
		 * @param wip    True if work in progress.
		 * @param assert The function which defines the assertion to satisfy.
		 */
		constructor(name, wip, assert) {
			this.name = name;
			this.wip = wip;
			this.assert = assert;
		}

		/**
		 * Runs the specified test.
		 * @param test The test to run.
		 * @return the test result;
		 */
		static async run(test) {
			if (test.wip === true) {
				return "[   WIP]";
			} else {
				try {
					return await test.assert() === true ? "[OK    ]" : "[   NOK]";
				} catch (exception) {
					return "[   EXP]";
				}
			}
		}

		/**
		 * Asserts the specified assertion is true.
		 * @param assertion The assertion to evaluate.
		 * @return true if the specified assertion is true.
		 */
		static assertTrue(assertion) {
			return assertion === true;
		}

		/**
		 * Asserts the specified assertion is false.
		 * @param assertion The assertion to evaluate.
		 * @return true if the specified assertion is false.
		 */
		static assertFalse(assertion) {
			return assertion === false;
		}

		/**
		 * Checks the value is not null.
		 * @param value The value to check.
		 * @return true if value is not null;
		 */
		static assertNotNull(value) {
			const assert = value != null;
			if (!assert) {
				log(assert);
			}
			return assert;
		}

		/**
		 * Checks the array is not null or empty.
		 * @param array The array to check.
		 * @return true if array is not empty or null;
		 */
		static assertNotEmptyArray(array) {
			const assert = Array.isArray(array) && array.length > 0;
			if (!assert) {
				log(assert);
			}
			return assert;
		}

		/**
		 * Checks the array is empty.
		 * @param array The array to check.
		 * @return true if array is empty;
		 */
		static assertEmptyArray(array) {
			const assert = Array.isArray(array) && _.size(array) === 0;
			if (!assert) {
				log(assert);
			}
			return assert;
		}

		/**
		 * Checks the object is null or empty.
		 * @param object The object to check.
		 * @return true if object is empty or null;
		 */
		static assertEmptyObject(object) {
			const assert = !_.isObject(object) || _.isEmpty(object);
			if (!assert) {
				log(assert);
			}
			return assert;
		}

		/**
		 * Checks the object is not null or empty.
		 * @param object The object to check.
		 * @return true if object is not empty or null;
		 */
		static assertNotEmptyObject(object) {
			const assert = _.isObject(object) && !_.isEmpty(object);
			if (!assert) {
				log(assert);
			}
			return assert;
		}
	
		/**
		 * Checks both arrays are equals.
		 * @param array1 The first array to check.
		 * @param array2 The second array to check.
		 * @return true if both arrays are equals.
		 */
		static assertArrayEqual(array1, array2) {
			return JSON.stringify(array1)==JSON.stringify(array2)
		}

	}

	/**
	 * The AbstractTestSuite class is the base class to define a testsuite.
	 */
	class TestSuite {

		/**
		 * @constructor.
		 * @param name The name of the testsuite.
		 */
		constructor(name) {
			this.name = name;
			this.tests = [];
		}

		/**
		 * Processes the specified command.
		 * @param cmd   The command to process.
		 * @param args  The command arguments.
		 * @param suite The test suite for which to handle the command.
		 */
		static async processCommand(cmd, args, suite) {
			if (cmd != suite.name || args[0] != 'test') return;
			log("Launch " + _.size(suite.tests) + " tests for module " + suite.name);
			for (let i=0; i<suite.tests.length; i++) {
				const test = suite.tests[i];
				log(await Odin.Test.run(test) + ": " + test.name);
			}
		}

		/**
		 * Add the specified test.
		 * @param name   The name of the test.
		 * @param wip    True if work in progress.
		 * @param assert The assertion to satisfy.
		 * @return the instance.
		 */
		add(name, wip, assert) {
			this.tests.push(new Test(name, wip, assert));
			return this;
		}

	}

	/**
	 * The PokerColor class defines poker color.
	 */
	class PokerColor extends Rankable {

		/**
		 * @constructor.
		 * @param name The name of the poker color.
		 * @param rank The rank of the color, from 1 to the lower priority.
		 */
		constructor(name, rank) {
			super(name, rank);
		}

	}

	/**
	 * The PokerCard class defines poker card.
	 */
	class PokerCard extends Rankable {

		/**
		 * @constructor.
		 * @param name The name of the poker card.
		 * @param rank The rank of the card, from 1 to the lower priority.
		 */
		constructor(name, rank) {
			super(name, rank);
		}

	}

	/**
	 * The poker card colors.
	 */
	const PokerColors = new Rankables()
		.withRankable(new PokerColor('♠', 1))
		.withRankable(new PokerColor('♥', 2))
		.withRankable(new PokerColor('♦', 3))
		.withRankable(new PokerColor('♣', 4));

	/**
	 * The poker cards.
	 */
	const PokerCards = new Rankables()
		.withRankable(new PokerCard('RJo', 1))
		.withRankable(new PokerCard('A♠', 2))
		.withRankable(new PokerCard('A♥', 3))
		.withRankable(new PokerCard('A♦', 4))
		.withRankable(new PokerCard('A♣', 5))
		.withRankable(new PokerCard('K♠', 6))
		.withRankable(new PokerCard('K♥', 7))
		.withRankable(new PokerCard('K♦', 8))
		.withRankable(new PokerCard('K♣', 9))
		.withRankable(new PokerCard('Q♠', 10))
		.withRankable(new PokerCard('Q♥', 11))
		.withRankable(new PokerCard('Q♦', 12))
		.withRankable(new PokerCard('Q♣', 13))
		.withRankable(new PokerCard('Ja♠', 14))
		.withRankable(new PokerCard('Ja♥', 15))
		.withRankable(new PokerCard('Ja♦', 16))
		.withRankable(new PokerCard('Ja♣', 17))
		.withRankable(new PokerCard('10♠', 18))
		.withRankable(new PokerCard('10♥', 19))
		.withRankable(new PokerCard('10♦', 20))
		.withRankable(new PokerCard('10♣', 21))
		.withRankable(new PokerCard('9♠', 22))
		.withRankable(new PokerCard('9♥', 23))
		.withRankable(new PokerCard('9♦', 24))
		.withRankable(new PokerCard('9♣', 25))
		.withRankable(new PokerCard('8♠', 26))
		.withRankable(new PokerCard('8♥', 27))
		.withRankable(new PokerCard('8♦', 28))
		.withRankable(new PokerCard('8♣', 29))
		.withRankable(new PokerCard('7♠', 30))
		.withRankable(new PokerCard('7♥', 31))
		.withRankable(new PokerCard('7♦', 32))
		.withRankable(new PokerCard('7♣', 33))
		.withRankable(new PokerCard('6♠', 34))
		.withRankable(new PokerCard('6♥', 35))
		.withRankable(new PokerCard('6♦', 36))
		.withRankable(new PokerCard('6♣', 37))
		.withRankable(new PokerCard('5♠', 38))
		.withRankable(new PokerCard('5♥', 39))
		.withRankable(new PokerCard('5♦', 40))
		.withRankable(new PokerCard('5♣', 41))
		.withRankable(new PokerCard('4♠', 42))
		.withRankable(new PokerCard('4♥', 43))
		.withRankable(new PokerCard('4♦', 44))
		.withRankable(new PokerCard('4♣', 45))
		.withRankable(new PokerCard('3♠', 46))
		.withRankable(new PokerCard('3♥', 47))
		.withRankable(new PokerCard('3♦', 48))
		.withRankable(new PokerCard('3♣', 49))
		.withRankable(new PokerCard('2♠', 50))
		.withRankable(new PokerCard('2♥', 51))
		.withRankable(new PokerCard('2♦', 52))
		.withRankable(new PokerCard('2♣', 53))
		.withRankable(new PokerCard('BJo', 54));

	/**
	 * The base class for queriable object and objects.
	 */
	class Queriable {

		/**
		 * @constructor.
		 * @param type    The type of the object.
		 * @param subtype The optional subtype of the object.
		 */
		constructor(type, subtype) {
			this.type = type;
			this.subtype = subtype;
		}

		/**
		 * Gets the specified objects.
		 * @param query The query used to get objects.
		 * @return the objects.
		 */
		getObjects(query) {
			const q = this.subtype != null ? 
				{ _type: this.type, _subtype: this.subtype } :
				{ _type: this.type };
			if (!_.isUndefined(query) && !_.isNull(query)) {
				Object.assign(q, query);
			}
			return findObjs(q)
		}

		/**
		 * Gets the specified object.
		 * @param query The query used to get object.
		 * @return the object.
		 */
		getObject(query) {
			return Collections.only(this.getObjects(query));
		}

	}

	/**
	 * The base class for all roll20 wrapped objects.
	 */
	class QueriableObject extends Queriable {

		/**
		 * @constructor.
		 * @param type    The type of the object.
		 * @param subtype The optional subtype of the object.
		 */
		constructor(type, subtype) {
			super(type, subtype);
			this.obj = null;
		}

		/**
		 * @return true if the object is valid. 
		 */
		isValid() {
			return !_.isUndefined(this.obj) && !_.isNull(this.obj);
		}

		/**
		 * Finds the object with the specified identifier.
		 * @param id The identifier of the object to find.
		 * @return the instance.
		 */
		findId(id) {
			if (this.subtype != null) {
				const o = getObj(this.type, id);
				this.obj = o != null && o.get('_subtype') === this.subtype ? o : null;
			} else {
				this.obj = getObj(this.type, id);
			}
			return this;
		}

		/**
		 * Finds the object with the specified query.
		 * @param query The query used to find the object.
		 * @return the instance.
		 */
		findObject(query) {
			this.obj = Collections.only(this.getObjects(query));
			return this;
		}

		/**
		 * Sets the specified object.
		 * @param obj The object to set.
		 * @return the instance.
		 */
		setObject(obj) {
			this.obj = obj;
			return this;
		}

		/**
		 * Fetches the object with the specified identifier.
		 * @param object The object to update.
		 * @param id     The identifier of the object to find.
		 * @return the instance.
		 */
		static async fetchId(object, id) {
			await new Promise(resolve => {
				setTimeout(() => resolve(object.findId(id)), 100);
			});
			return object;
		}

		/**
		 * Fetches the object with the specified query.
		 * @param query The query used to find the object.
		 * @return the instance.
		 */
		static async fetchObject(object, query) {
			await new Promise(resolve => {
				setTimeout(() => resolve(object.findObject(query)), 100);
			});
			return object;
		}

	}

	/**
	 * The base class for roll20 object collections.
	 */
	class QueriableObjects extends Queriable {

		/**
		 * @constructor.
		 * @param type    The type of the object.
		 * @param subtype The optional subtype of the object.
		 */
		constructor(type, subtype) {
			super(type, subtype);
			this.objs = null;
		}

		/**
		 * Finds the specified objects with the specified query.
		 * @param query The query used to find the objects, null to retrieve all.
		 * @return the matching objects.
		 */
		findObjects(query) {
			this.objs = this.getObjects(query);
			return this;
		}

		/**
		 * Filters the objects
		 * @param predicate The predicate to realize.
		 * @return the instance.
		 */
		filter(predicate) {
			this.objs = _.filter(this.objs, predicate);
			return this;
		}

		/**
		 * Sets the specified objects.
		 * @param objs The objects to set.
		 * @return the instance.
		 */
		setObjects(objs) {
			this.objs = objs;
			return this;
		}

		/**
		 * Fetches the specified objects of the specified collection.
		 * @param collection The collection to update. 
		 * @param query      The query used to find the objects.
		 * @return the collection.
		 */
		static async fetchObjects(collection, query) {
			await new Promise(resolve => {
				setTimeout(() => resolve(collection.findObjects(query)), 100);
			});
			return collection;
		}

	}

	/**
	 * The Player class provides features to get and manipulate a player.
	 */
	class Player extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('player', null);
		}

		/**
		 * Finds the specified player.
		 * @param name The name of the player to find.
		 * @return the instance.
		 */
		findName(name) {
			this.findObject({'_displayname': name});
			return this;
		}

		/**
		 * @return true if the player is online.
		 */
		isOnline() {
			return this.isValid() && this.obj.get('_online') === true;
		}

		/**
		 * @return true if the player is online and a game master. 
		 */
		isMaster() {
			return this.isValid() && playerIsGM(this.obj.get('id')) === true;
		}

		/**
		 * @return true if the player is online and not a game master. 
		 */
		isPlayer() {
			return this.isValid() && playerIsGM(this.obj.get('id')) === false;
		}

		/**
		 * Fetches the player with the specified name.
		 * @param player The player to fetch.
		 * @param name   The name of the player to fetch.
		 * @return the instance.
		 */
		static async fetchName(player, name) {
			return QueriableObject.fetchObject(player, {'_displayname': name})
		}

	}

	/**
	 * The Players class provides functionnalities to get and filter players.
	 */
	class Players extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('player', null);
		}

		/**
		 * Finds the online or offline players.
		 * @param online True if players must be online.
		 * @return the instance.
		 */
		findOnline(online) {
			this.findObjects({'_online': online});
			return this;
		}

		/**
		 * Finds the players or the game masters.
		 * @param master True if players must be game master.
		 * @return filtered players.
		 */
		filterMaster(master) {
			return this.filter(function(obj) { return (playerIsGM(obj.get('id')) === master); });
		}

		/**
		 * Fetches online or offline players.
		 * @param players The players to update.
		 * @param online  True if players must be online.
		 * @return the players.
		 */
		static async fetchOnline(players, online) {
			await new Promise(resolve => {
				setTimeout(() => resolve(players.findOnline(online)), 100);
			});
			return players;
		}

	}

	/**
	 * The Page class provides features to get and manipulate a page.
	 */
	class Page extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('page', null);
		}

		/**
		 * @return true if the page is active. 
		 */
		isActive() {
			return this.isValid() && Campaign().get('playerpageid') === this.obj.get('id');
		}

		/**
		 * Activates the page for players.
		 * @return the instance. 
		 */
		activate() {
			if (this.isValid() && Campaign().get('playerpageid') != this.obj.get('id')) {
				Campaign().set('playerpageid', this.obj.get('id'));
			}
			return this;
		}

		/**
		 * Finds the active page.
		 * @return the instance.
		 */
		findActive() {
			this.findObject({'id': Campaign().get('playerpageid')});
			return this;
		}

		/**
		 * Fetches the page with the specified name.
		 * @param page The page to fetch.
		 * @param name The name of the page to fetch.
		 * @return the instance.
		 */
		static async fetchName(page, name) {
			return QueriableObject.fetchObject(page, {'name': name})
		}

	}

	/**
	 * The Pages class provides functionnalities to get and filter pages.
	 */
	class Pages extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('page', null);
		}

		/**
		 * Activates the specified page.
		 * @param page The page to activate.
		 * @return the page.
		 */
		static async activate(page) {
			await new Promise(resolve => {
				setTimeout(() => resolve(page.activate()), 100);
			});
			return page;
		}

	}

	/**
	 * The Character class provides features to get and manipulate a character.
	 */
	class Character extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('character', null);
		}

		/**
		 * @return true if the character is a player character. 
		 */
		isPlayerCharacter() {
			return !_.isNull(this.obj) && this.obj.get('controlledby') != '';
		}

		/**
		 * Finds the specified character.
		 * @param name The name of the character to find.
		 * @return the instance.
		 */
		findName(name) {
			this.findObject({'name': name});
			return this;
		}

		/**
		 * Fetches the character with the specified name.
		 * @param character The character to fetch.
		 * @param name      The name of the character to fetch.
		 * @return the instance.
		 */
		static async fetchName(character, name) {
			return QueriableObject.fetchObject(character, {'name': name})
		}

	}

	/**
	 * The Characters class provides functionnalities to get and filter characters.
	 */
	class Characters extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('character', null);
		}

	}

	/**
	 * The Token class provides features to get and manipulate a token.
	 * Token must be on the table since getters only returns visible tokens.
	 */
	class Token extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('graphic', 'token');
		}

	}

	/**
	 * The Tokens class provides functionnalities to get and filter tokens.
	 * Tokens must be on the table since getters only returns visible tokens.
	 */
	class Tokens extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('graphic', 'token');
		}

		/**
		 * Finds tokens in the specified page.
		 * @param page The page on which the tokens must be.
		 * @return the instance.
		 */
		findOnPage(page) {
			this.findObjects({'_pageid': page.obj.get('id')});
			return this;
		}

		/**
		 * Fetches tokens in the specified page.
		 * @param tokens The tokens to update.
		 * @param page   The page on which the tokens must be.
		 * @return the tokens.
		 */
		static async fetchOnPage(tokens, page) {
			await new Promise(resolve => {
				setTimeout(() => resolve(tokens.findOnPage(page)), 100);
			});
			return tokens;
		}

	}

	/**
	 * The Deck class provides features to get and manipulate a deck.
	 */
	class Deck extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('deck', null);
			this.size = null;
		}

		/**
		 * Sets the specified number of cards.
		 * @param size The size of the deck.
		 * @return the instance.
		 */
		setSize(size) {
			this.size = size;
			return this;
		}

		/**
		 * Finds the specified deck.
		 * @param name The name of the deck to find.
		 * @return the instance.
		 */
		findName(name) {
			this.findObject({'name': name});
			return this;
		}

		/**
		 * Recalls cards.
		 * @return the instance.
		 */
		recall() {
			recallCards(this.obj.get('id'));
			return this;
		}

		/**
		 * Shuffles deck.
		 * @return the instance.
		 */
		shuffle() {
			shuffleDeck(this.obj.get('id'));
			return this;
		}

		/**
		 * @return the cards in the deck just after the last shuffle.
		 */
		lastShuffle() {
			return this.isValid() ? new Cards().setObjects(
				_.chain(this.obj.get('currentDeck').split(/\s*,\s*/))
				 .map(cardid => getObj('card', cardid))
				 .reject(_.isUndefined)
				 .value()) : null;
		}

		/**
		 * Recalls all cards, shuffle the specified deck.
		 * @param deck The deck for which to recall the cards.
		 * @return the deck.
		 */
		static async recallCards(deck) {
			await new Promise(resolve => {
				setTimeout(() => resolve(deck.recall(), 100));
			});
			deck.shuffle();
			if (deck.size != null) {
				let iter = 0;
				await Deck.fetchId(deck, deck.obj.get('id'));
				while (_.size(deck.obj.get('currentDeck').split(/\s*,\s*/)) != deck.size && iter < 20) {
					log("sss = " + _.size(deck.obj.get('currentDeck').split(/\s*,\s*/)));
					iter++;
					await Deck.fetchId(deck, deck.obj.get('id'));
				}
			}
			return deck;
		}

		/**
		 * Fetches the deck with the specified name.
		 * @param deck The deck to fetch.
		 * @param name The name of the deck to fetch.
		 * @return the instance.
		 */
		static async fetchName(deck, name) {
			return QueriableObject.fetchObject(deck, {'name': name})
		}

	}

	/**
	 * The Decks class provides functionnalities to get and filter decks.
	 */
	class Decks extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('deck', null);
		}

		/**
		 * Shuffles decks.
		 * @return the instance.
		 */
		shuffle() {
			_.each(this.objs, obj => shuffleDeck(obj.get('id')));
			return this;
		}

		/**
		 * Recalls cards.
		 * @return the instance.
		 */
		recall() {
			_.each(this.objs, obj => recallCards(obj.get('id')));
			return this;
		}

	}

	/**
	 * The Card class provides features to get and manipulate a token.
	 */
	class Card extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('graphic', 'card');
		}

		/**
		 * Finds the card with the specified id.
		 * @param id The identifier of the card to find, that is not the graphic id.
		 * @return the instance.
		 */
		findId(id) {
			this.obj = getObj(this.subtype, id);
			return this;
		}

	}

	/**
	 * The Cards class provides functionnalities to get and filter cards.
	 */
	class Cards extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('graphic', 'card');
		}

		/**
		 * Finds all cards on the table regardless of the decks.
		 * @return the instance.
		 */
		findTable() {
			this.objs = _.chain(this.findObjects().objs)
			             .map(obj => getObj('card', obj.get('cardid')))
			             .reject(_.isUndefined)
			             .value();
			return this;
		}

		/**
		 * Fetches all cards on the table regardless of the decks.
		 * @param The cards collection to update. 
		 * @return the instance.
		 */
		static async fetchTable(cards) {
			await new Promise(resolve => {
				setTimeout(() => resolve(cards.findTable()), 100);
			});
			return cards;
		}

	}

	/**
	 * The Hand class provides features to get and manipulate a hand.
	 */
	class Hand extends QueriableObject {

		/**
		 * @constructor.
		 */
		constructor() {
			super('hand', null);
		}

	}

	/**
	 * The Hands class provides functionnalities to get and filter hands.
	 */
	class Hands extends QueriableObjects {

		/**
		 * @constructor.
		 */
		constructor() {
			super('hand', null);
		}

	}

	/**
	 * The Dice class is the class used to manage dice roll.
	 */
	class Dice {

		/**
		 * @constructor
		 * @param side The number of side.
		 */
		constructor(side) {
			this.side = side;
			this.open = true;
		}

		/**
		 * Open the dice.
		 * @return the dice.
		 */
		open() {
			this.open = true;
			return this;
		}

		/**
		 * Closes the dice.
		 * @return the dice.
		 */
		close() {
			this.open = false;
			return this;
		}

		/**
		 * @return a dice roll value.
		 */
		value() {
			const value = randomInteger(this.side);
			return this.open === true && this.side === value ? value + this.value() : value;
		}

		/**
		 * @return a dice roll.
		 */
		roll() {
			return new Roll(this, this.value());
		}

		/**
		 * @return the textual expression of the instance.
		 */
		toString() {
			return "d" + this.side;
		}

	}

	/**
	 * The Dices class defines a pool of dices which can be rolled.
	 */
	class Dices {

		/**
		 * @constructor
		 */
		constructor() {
			this.dices = new Map();
		}

		/**
		 * Removes all dices.
		 * @eturn the instance.
		 */
		clear() {
			this.dices = new Map();
			return this;
		}

		/**
		 * Adds the specified dices.
		 * @param dice The type of dice to add.
		 * @param size The number of dices to add.
		 * @eturn the instance.
		 */
		add(dice, size) {
			this.dices.set(dice, size);
			return this;
		}

		/**
		 * @return a new rolls.
		 */
		roll() {
			const rolls = new Rolls();
			for (let [dice,size] of this.dices) {
				for (let i=0; i<size; i++) {
					rolls.add(dice.roll());
				}
			}
			return rolls;
		}

		/**
		 * @return the textual expression of the dices.
		 */
		toString() {
			const dices = [];
			for (let [dice,size] of this.dices) {
				dices.push(size + dice.toString());
			}
			return dices.join(", ");
		}

	}

	/**
	 * The Roll class defines a dice roll.
	 */
	class Roll {

		/**
		 * @constructor
		 * @param dice  The rolled dice.
		 * @param value The roll value.
		 */
		constructor(dice, value) {
			this.dice = dice;
			this.value = value;
		}

		/**
		 * @return the textual expression of the instance.
		 */
		toString() {
			return this.value + "(" + this.dice.toString() + ")";
		}

	}

	/**
	 * The Rolls class defines a pool of dices rolls. It provides some utilities to
	 * interpret the result according to the game system.
	 */
	class Rolls {

		/**
		 * @constructor
		 */
		constructor() {
			this.rolls = [];
		}

		/**
		 * @return the number of rolls.
		 */
		size() {
			return this.rolls.length;
		}

		/**
		 * @return all values.
		 */
		values() {
			return _.map(this.rolls, function(r) { return r.value; });
		}

		/**
		 * @return the minimum value of the rolls.
		 */
		min() {
			return _.min(this.values());
		}

		/**
		 * @return the maximum value of the rolls.
		 */
		max() {
			return _.max(this.values());
		}

		/**
		 * @return the sum of the values.
		 */
		sum() {
			return _.reduce(this.rolls, function(sum, r) { return sum + r.value; }, 0);
		}

		/**
		 * Gets the rolls which satisfy the specified predicate.
		 * @param predicate The predicate to satisfy.
		 * @return the matching rolls.
		 */
		get(predicate) {
			return _.filter(this.rolls, predicate);
		}

		/**
		 * Produces a new rolls by mapping each roll through the specified transformation function.
		 * @param to The transformation function.
		 * @return the instance.
		 */
		transform(to) {
			this.rolls = _.map(this.rolls, to);
			return this;
		}

		/**
		 * Rejects the rolls which satisfies the specified predicate.
		 * @param predicate The predicate to satisfy.
		 * @return the instance.
		 */
		reject(predicate) {
			this.rolls = _.reject(this.rolls, predicate);
			return this;
		}

		/**
		 * Filters the rolls which satisfies the specified predicate.
		 * @param predicate The predicate to satisfy.
		 * @return the filtered rolls.
		 */
		filter(predicate) {
			this.rolls = _.filter(this.rolls, predicate);
			return this;
		}

		/**
		 * Indicates if some roll satisfies the specified predicate.
		 * @param predicate The predicate to satisfy.
		 * @return true if some roll satisfies the predicate.
		 */
		some(predicate) {
			return _.some(this.rolls, predicate);
		}

		/**
		 * Counts the number of rolls which satisfy the specified predicate.
		 * @param predicate The predicate to satisfy.
		 * @return the number of satisfied rolls.
		 */
		count(predicate) {
			return _.filter(this.rolls, predicate).length;
		}

		/**
		 * Gets the number of rolls for which the value is equal to the specified one.
		 * @param value The value to search.
		 * @return the number of matching roll.
		 */
		numberOf(value) {
			return this.count(r => r.value === value);
		}

		/**
		 * Indicates if the greatest roll is greater or equal than the specified value.
		 * @param value The threshold to reach.
		 * @return true if the threshold has been reached.
		 */
		atLeast(value) {
			return this.some(function (r) { return r.value >= value; });
		}

		/**
		 * @return the textual expression of the rolls.
		 */
		toString() {
			return this.rolls.join(", ");
		}

		/**
		 * Adds the specified roll.
		 * @param roll The roll to add.
		 * @eturn the instance.
		 */
		add(roll) {
			this.rolls.push(roll);
			return this;
		}

	}

	/**
	 * The Turn class defines registrable item of the turn order.
	 */
	class Turn {

		/**
		 * @constructor
		 * @param id The identifier of the graphic object.
		 * @param pr The value of the turn.
		 */
		constructor(id, pr) {
			this.id = id;
			this.pr = pr;
			this.custom = "";
		}

	}

	/**
	 * The TurnOrder class provides functionnalities to manage intiative, turns and rounds.
	 */
	class TurnOrder {

		/**
		 * @constructor
		 * @param order The function which defines the order to set.
		 */
		constructor(order) {
			this.order = order;
		}

		/**
		 * @return true if the turn order is displayed.
		 */
		isDisplayed() {
			return Campaign().get('initiativepage');
		}

		/**
		 * @return the turn order from parsing the campaign property.
		 */
		parse() {
			const to = Campaign().get('turnorder');
			return to === "" ? [] : JSON.parse(to);
		}

		/**
		 * Clears the current turn order.
		 * @return the instance.
		 */
		clear() {
			Campaign().set('turnorder', '[]');
			return this;
		}

		/**
		 * Sets the specified turn order to the campaign property according to the specified order if defined.
		 * @param turnOrder The turn order to set.
		 * @return the instance.
		 */
		set(turnOrder) {
			const turns = this.order != null ? _.sortBy(turnOrder, this.order) : turnOrder;
			Campaign().set('turnorder', JSON.stringify(turns));
			return this;
		}

		/**
		 * Adds the specified turns.
		 * @param turns The turns to add.
		 * @return the instance.
		 */
		add(turns) {
			return this.set(this.parse().concat(turns));
		}

		/**
		 * Inserts the specified turns at the top of the turn order, regardless of the order.
		 * @param turns The turns sto insert.
		 * @return the instance.
		 */
		insert(turns) {
			const _turns = this.parse();
			_.each(turns, function(t) {
				_turns.unshift(t);
			})
			Campaign().set('turnorder', JSON.stringify(_turns));
			return this;
		}

		/**
		 * Pops the first turn.
		 * @return the identifier of the token.
		 */
		pop() {
			const turns = this.parse();
			const turn = turns.shift();
			this.set(turns);
			return turn == null ? null : turn.id;
		}

		/**
		 * Shows the turn order.
		 * @return the instance.
		 */
		show() {
			Campaign().set('initiativepage', true);
			return this;
		}

		/**
		 * Hides the turn order.
		 * @return the instance.
		 */
		hide() {
			Campaign().set('initiativepage', false);
			return this;
		}

	}

	/**
	 * @return the public elements.
	 */
	return  {
		Rankable: Rankable,
		Rankables: Rankables,
		Test: Test,
		TestSuite: TestSuite,
		EventHandler: EventHandler,
		Player: Player,
		Players: Players,
		Page: Page,
		Pages: Pages,
		Character: Character,
		Characters: Characters,
		Token: Token,
		Tokens: Tokens,
		Deck: Deck,
		Decks: Decks,
		Card: Card,
		Cards: Cards,
		Hand: Hand,
		Hands: Hands,
		PokerColor: PokerColor,
		PokerCard: PokerCard,
		PokerColors: PokerColors,
		PokerCards: PokerCards,
		Dice: Dice,
		Dices: Dices,
		Roll: Roll,
		Rolls: Rolls,
		Turn: Turn,
		TurnOrder: TurnOrder
	};

})();
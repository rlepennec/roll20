/**
 * The Deadlands module provides common tools for Deadlands Classic.
 */
var Deadlands = (function() {
	'use strict';

	/**
	 * The RollInterpreter class provides functionnalities to manage Deadlands rolls.
	 */
	class RollInterpreter {

		/**
		 * Indicates if the specified rolls is a fumble.
		 * @param rolls The rolls to interpret.
		 * @return true if the rolls is a fumble.
		 */
		static isFumble(rolls) {
			return rolls.size() === 0 ? false : parseFloat(rolls.numberOf(1)) >= parseFloat(rolls.size()/2);
		}

		/**
		 * Gets the number of success.
		 * @param value The rolls value to interpret.
		 * @param tn    The difficulty target number.
		 * @return the number rof success:
		 *     0 : Fail
		 *     1 : Success
		 *     2 : Success with 1 degree
		 *     N : Success with N-1 degrees
		 */
		static getSuccess(value, tn) {
			return value < tn ? 0 : Math.floor(value/5);
		}

		/**
		 * Gets the number of success for the specified skill roll.
		 * @param rolls    The rolls to interpret.
		 * @param tn       The difficulty target number.
		 * @param modifier The modifier to apply to the roll.
		 * @return the number of success:
		 *    -1 : Fumble
		 *     0 : Fail
		 *     1 : Success
		 *     2 : Success with 1 degree
		 *     N : Success with N-1 degrees
		 */
		static skill(rolls, tn, modifier) {
			return RollInterpreter.isFumble(rolls) ? -1 : RollInterpreter.getSuccess(rolls.max() + modifier, tn);
		}

		/**
		 * Gets the number of success for the specified unskill roll.
		 * @param rolls    The rolls to interpret.
		 * @param tn       The difficulty target number.
		 * @param modifier The modifier to apply to the roll.
		 * @return the number of success:
		 *    -1 : Fumble
		 *     0 : Fail
		 *     1 : Success
		 *     2 : Success with 1 degree
		 *     N : Success with N-1 degrees
		 */
		static unskill(rolls, tn, modifier) {s
			return RollInterpreter.isFumble(rolls) ? -1 : RollInterpreter.getSuccess(Math.floor(rolls.max()/2) + modifier, tn);
		}
	
		static rollSkill(attribute, coordination, skill, tn, modifier) {
			if (skill > 0) {
				return skill(new Odin.Dices(attribute, skill).rolls(), tn, modifier);
			} else {
				return unskill(new Odin.Dices(attribute, coordination).rolls(), tn, modifier);
			}
		}

	}

	/**
	 * The PokerHand class provides functionnalities to manage the pocker hand of a character.
	 * It's used to define the turn order.
	 */
	class PokerHand {

		/**
		 * @constructor
		 * @param deck  The associated poker deck.
		 * @param token The identifier of the token which represents the character.
		 */
		constructor(deck, token) {
			this.deck = deck;
			this.token = token;
		}

	}

	/**
	 * The PokerDeck class provides functionnalities to manage poker deck. It's used for
	 * the turn order, the huckster tricks.
	 */
	class PokerDeck {

		/**
		 * @constructor
		 */
		constructor() {
			this.deck = Array.from(PokerCardRank.keys());
			this.given = new Map();
			this.discard = [];
		}

		/**
		 * Defines a new poker card.
		 */


		/**
		 * Gives the specified number of cards to the specified character.
		 * @param id     The identifier of the token.
		 * @param number The number of cards to give.
		 * @return the array of given cards.
		 */
		give(id, number) {
			
		}

		/**
		 * @return new poker deck.
		 */
		static cards() {
			
		}

	}

	/**
	 * The Rolls class provides functionnalities to manages characters rolls. The GM specifies the roll to process, using the
	 * methods start. Each character can then rolls and improves the result using macros.
	 */
	class Rolls {

		/**
		 * @constructor
		 */
		constructor() {
			this.rolls = new Map();
			this.attribute = null;
			this.skill = null;
			this.tn = null;
		}

		/**
		 * Starts the specified attribute roll.
		 * @param attribute The name of the attribute to roll.
		 * @param tn        The difficulty.
		 */
		attribute(attribute, tn) {
			this.rolls = new Map();
			this.attribute = attribute;
			this.skill = null;
			this.tn = null;
		}

		/**
		 * Starts the specified skill roll.
		 * @param attribute The name of the attribute to roll.
		 * @param skill     The name of the skill to roll.
		 * @param tn        The difficulty.
		 */
		skill(attribute, skill, tn) {
			this.rolls = new Map();
			this.attribute = attribute;
			this.skill = skill;
			this.tn = tn;
		}

		/**
		 * Adds the specified character roll. Retrieves the number and the type of dices to roll,
		 * rolls the dices and registers the result for the specified character.
		 * @param id The identifier of the character.
		 */
		character(id) {
			const size = 2;
			const dice = 6;
			this.rolls.set(id, new Odin.Rolls().add(new Odin.Roll(new Odin.Dice(this.dice(id)), this.size(id))));
		}

		/**
		 * Stops the roll.
		 */
		stop() {
			this.rolls = new Map();
			this.attribute = null;
			this.skill = null;
		}

		/**
		 * Gets the number of dice to roll for the specified character and the current roll.
		 * @param id The identifier of the character.
		 * @return the number of dice to roll.
		 */
		size(id) {
			return 2;
		}

		/**
		 * Gets the type of dice to roll for the specified character and the current roll.
		 * @param id The identifier of the character.
		 * @return the type of dice to roll.
		 */
		dice(id) {
			return 6;
		}

	}

	/**
	 * The TurnOrder class provides functionnalities to manage intiative, turns and rounds.
	 */
	class TurnOrder extends Odin.TurnOrder {

		/**
		 * @constructor
		 */
		constructor() {
			super(function(turn) {
				return Odin.PokerCards.rank(turn.pr);
			});
		}

		/**
		 * Starts the turn.
		 */
		start() {
			
		}

		/**
		 * Starts a next round.
		 */
		newRound() {
			
		}

		/**
		 * Finishes
		 */
		finish() {
			
		}

	}

	/**
	 * The EventHandler class is the main class to handle commands.
	 */
	class EventHandler {

		/**
		 * @constructor
		 */
		constructor() {
			this.rolls = new Rolls();
		}

		/**
		 * Processes the specified command.
		 * @param cmd     The command to process.
		 * @param args    The command arguments.
		 * @param handler The ovbject which handle the command.
		 */
		static processCommand(cmd, args, handler) {
			if (cmd != 'dl') return;
			if (args.length > 0) {


				if (args[0] === 'skill') {
					const size = parseInt(args[1], 10);
					const dice = parseInt(args[2], 10);
					const tn = parseInt(args[3], 10);
					log(size + "d" + dice + " SD:" + tn);
					handler.openRoll(size, dice, 0, tn);

				} else if (args[0] === 'attribute') {
					const size = parseInt(args[1], 10);
					const dice = parseInt(args[2], 10);
					const tn = parseInt(args[3], 10);
					log(size + "d" + dice + " SD:" + tn);
					handler.openRoll(size, dice, 0, tn);

				} else if (args[0] === 'rolls') {
					const attribute = args[1];
					const skill = null;
					const tn = parseInt(args[2], 5);
					handler.rolls.attribute(attribute, tn);
				}

			}

		}

		/**
		 * Handles the specified roll.
		 * @param size     The number of dices to roll.
		 * @param dice     The type of dices to roll.
		 * @param modifier The roll modifier to apply.
		 * @param tn       The difficulty target number.
		 */
		openRoll(size, dice, modifier, tn) {
			log("openRoll");

			const rolls = new Odin.Dices()
				.add(new Odin.Dice(dice), size)
				.roll();

			let result = null;
			if (RollInterpreter.isFumble(rolls) === true) {
				result = "Tu t'es planté !";
			} else if (rolls.atLeast(tn) === false) {
				result = "Tu as échoué";
			} else {
				result = "Tu réussis avec " + RollInterpreter.getSuccess(rolls.max(), tn) + " degré(s)"
			}

			let html = "";
			html += "<div class='sheet-rolltemplate-default'>";
			html += "<table>";
			html += "<caption>Jet " + size + "d" + dice + " SD:" + tn + "</caption>";
			html += "<tr>";
			html += "<td>Dés:</td>";
			html += "<td>" + rolls.toString() + "</td>";
			html += "</tr>";
			html += "<td>Resultat:</td>";
			html += "<td>" + rolls.max() + " :" + result + "</td>";
			html += "</tr>";
			html += "</table>";
			html += "</div>";
			sendChat("Summary", html);

		}

	}


	/**
	 * The message handler.
	 */
	const handler = new EventHandler();

	/**
	 * @return the public elements.
	 */
	return  {
		RollInterpreter : RollInterpreter,
		Rolls: Rolls,
		TurnOrder: TurnOrder,
		EventHandler: EventHandler,
		handler: handler
	};

})();

//The API message subscribtion.
on('ready',function() {
	'use strict';
	on('chat:message', (msg) => {
		Odin.EventHandler.handleCommand(msg, Deadlands.EventHandler.processCommand, Deadlands.handler);
	});
});
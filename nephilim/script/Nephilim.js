/**
 * The Symbaroum module provides common tools for Nephilim.
 */
var Nephilim = (function() {
	'use strict';

	/**
	 * The Roll class is used to handle dice roll commands.
	 */
	class Roller {

		/**
		 * Constructor.
		 */
		constructor() {
			this.dice = 0;
		}

		roll() {
			this.dice = randomInteger(100);
			return this;
		}

		result() {
			return this.dice.toString();
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
			this.roller = new Roller();
		}

		/**
		 * Processes the specified message.
		 * @param msg The message to process.
		 */
		processMessage(msg) {

			const args = msg.content.split(/\s+/);
			const cmd = args.shift().substring(1);

			if (cmd != 'nephilim') return;

			sendChat(
				msg.who,
				this.roller.roll().result());


		}

		/**
		 * @return the command usage.
		 */
		usage() {
			return "Use !nephilim roll";
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
		handler: handler,
	};

})();

/**
 * The API message subscribtion.
 */
on('ready',function() {
	'use strict';
	on('chat:message', (msg) => {
		if (msg.type != 'api') return;
		Nephilim.handler.processMessage(msg);
	});
});

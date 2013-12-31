/**
 * Updates the various buff bars
 *
 * @return {void}
 */
CookieMonster.manageBuffs = function() {
	this.manageFrenzyBars();
	this.manageClickingFrenzy();
	this.manageNextCookie();
	this.manageNextReindeer();
};

/**
 * Get the width of the timers container
 *
 * @return {Integer}
 */
CookieMonster.getBarsWidth = function() {
	return parseInt(this.$timerBars.css('width'), 10);
};

//////////////////////////////////////////////////////////////////////
///////////////////////////// DOM ELEMENTS ///////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Create the bars container
 *
 * @return {void}
 */
CookieMonster.createBarsContainer = function() {
	var $version = $('#versionNumber');

	// Create container and move version inside it
	$('#sectionLeft').append('<div id="cookie-monster__buff-bars"><div id="versionNumber">' +$version.text()+ '</div></div>');
	$version.remove();

	this.$timerBars = $('#cookie-monster__buff-bars');
};

//////////////////////////////////////////////////////////////////////
////////////////////////////////// BARS //////////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Manage regular frenzies bars
 *
 * @return {void}
 */
CookieMonster.manageFrenzyBars = function() {
	var frenzyName = '';
	var color      = '';
	var multiplier = 0;

	// Detect what kind of frenzy we're in
	switch (Game.frenzyPower) {
		case 7:
			multiplier = 77 + 77 * Game.Has('Get lucky');
			frenzyName = 'Frenzy';
			color      = 'yellow';
			break;

		case 666:
			multiplier = 6 + 6 * Game.Has('Get lucky');
			frenzyName = 'Blood Frenzy';
			color      = 'green';
			break;

		case 0.5:
			multiplier = 66 + 66 * Game.Has('Get lucky');
			frenzyName = 'Clot';
			color      = 'red';
			break;
	}

	// Remove bars if the frenzy has ended or we disabled them
	if (Game.frenzy <= 0 || !this.getBooleanSetting('BuffBars')) {
		return this.fadeOutBar(color);
	}

	this.updateBar(frenzyName, color, Game.frenzy);

	// No idea what that does
	var buffColors = ['yellow', 'green', 'red'];
	for (var thisColor in buffColors) {
		this.fadeOutBar(buffColors[thisColor], color);
	}
};

/**
 * Manage clicking frenzies bars
 *
 * @return {void}
 */
CookieMonster.manageClickingFrenzy = function() {
	if (Game.clickFrenzy <= 0 || !this.getBooleanSetting('BuffBars')) {
		return this.fadeOutBar('Clickfrenzy');
	}

	this.updateBar('Click frenzy', 'blue', Game.clickFrenzy);
};

/**
 * Manage the "Next Reindeer" bar
 *
 * @return {void}
 */
CookieMonster.manageNextReindeer = function() {
	var timers = [Game.seasonPopup.time, Game.seasonPopup.minTime, Game.seasonPopup.maxTime];
	var width  = timers[2] - timers[0];

	// Hide if Reindeer on screen
	if (timers[0] <= 0 || this.onScreen.seasonPopup || !this.getBooleanSetting('CookieBar')) {
		return this.fadeOutBar('NextReindeer');
	}

	var $container = this.updateBar('Next Reindeer', 'greyLight', width, width / timers[2] * 100);
	$('.cm-buff-bar__bar--second', $container).css('max-width', (this.getBarsWidth() - 189) * 0.67 + "px");
};

/**
 * Manage the "Next cookie" bar
 *
 * @return {void}
 */
CookieMonster.manageNextCookie = function() {
	var timers    = [Game.goldenCookie.time, Game.goldenCookie.minTime, Game.goldenCookie.maxTime];

	// Cancel if disabled
	if (timers[0] <= 0 || this.onScreen.goldenCookie || !this.getBooleanSetting('CookieBar')) {
		return this.fadeOutBar('NextCookie');
	}

	// Compute necessary informations
	var width     = timers[2] - timers[0];
	var countdown = Math.round(width / Game.fps);

	// Update title
	if (countdown > 0 && !this.onScreen.goldenCookie) {
		this.titleModifier = this.getBooleanSetting('CookieBar') ? '(' + countdown + ') ' : '';
	}

	var $container = this.updateBar('Next Cookie', 'greyLight', width, width / timers[2] * 100);
	$('.cm-buff-bar__bar--second', $container).css('max-width', (this.getBarsWidth() - 189) * 0.67 + 'px');
};

//////////////////////////////////////////////////////////////////////
//////////////////////////////// HELPERS /////////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Update a buff bar's informations
 *
 * @param {String}  name
 * @param {String}  color
 * @param {Integer} timer
 * @param {Integer} width
 *
 * @return {void}
 */
CookieMonster.updateBar = function (name, color, timer, width) {
	var identifier = name.replace(' ', '');
	var $bar  = $('#cookie-monster__timer-'+identifier);
	var count = Math.round(timer / Game.fps);

	// Check existence
	if ($bar.length === 0) {
		this.createBar(name, color);
	}

	// Update timer
	var $container = $('#cmt_'+identifier);
	$('#cmt_time_'+identifier).text(count);
	$bar.fadeIn(250);

	// Old-school if transitions are unsupported
	if (typeof document.body.style.transition === 'undefined') {
		return $container.css('width', width || timer / Game.goldenCookie.maxTime * 100);
	}

	// Check if we applied transitions
	if ($container.hasClass('active')) {
		return;
	}

	// Add transition
	setTimeout(function() {
		$container.css('transition', 'width linear ' +count+ 's').addClass('active');
	}, 100);
};

/**
 * Append a timer bar
 *
 * @param {String}  color
 * @param {Integer} count
 *
 * @return {void}
 */
CookieMonster.createBar = function (name, color) {
	var secondBars = {'Next Cookie': 'purple', 'Next Reindeer': 'orange'};
	var secondBar  = secondBars[name] || '';
	var identifier = name.replace(' ', '');

	// Add second bar for golden cookies
	if (secondBar) {
		secondBar = '<div class="cm-buff-bar__bar cm-buff-bar__bar--second background-' +secondBar+ '" id="cmt2_'+secondBar+'"></div>';
	}

	this.$timerBars.append(
		'<div class="cm-buff-bar" id="cookie-monster__timer-' + identifier + '">'+
			'<table cellpadding="0" cellspacing="0">'+
				'<tr>' +
					'<td>' + name + "</td>" +
					'<td>'+
						'<div class="cm-buff-bar__container background-' +color+ '" id="cmt_' + identifier + '">'+
							secondBar +
							'<div class="cm-buff-bar__timer" id="cmt_time_' + identifier + '">0</div>'+
						'</div>'+
					'</td>'+
					'<td style="width:55px;"></td>'+
				'</tr>' +
			'</table>'+
		'</div>');

	return $('#cmt_'+identifier);
};

/**
 * Fade out a bar of a certain color
 *
 * @param {string} color
 *
 * @return {void}
 */
CookieMonster.fadeOutBar = function(color, match) {
	var $bar = $("#cookie-monster__timer-" + color);

	if ($bar.length === 1 && $bar.css("opacity") === "1" && color !== match) {
		$bar.stop(true, true).fadeOut(250);
		$bar.find('.cm-buff-bar__container').removeClass('active').attr('style', '');
	}
};
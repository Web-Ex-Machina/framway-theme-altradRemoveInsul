import goalSeek from 'goal-seek';
document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");
app.labels.errors.inputs.empty.nl     = 'Vul het veld "%s" in';
app.labels.errors.inputs.incorrect.nl = 'De waarde die is ingevoerd in het veld "%s" is onjuist';
app.labels.buttons.next.nl            = 'Volgende';
app.labels.buttons.prev.nl            = 'Vorige';
app.labels.buttons.send.nl            = 'Versturen';
app.labels.miscs.seeMore.nl           = 'Meer informatie';

function forecast(x, ky, kx){
   var i=0, nr=0, dr=0,ax=0,ay=0,a=0,b=0;
   function average(ar) {
          var r=0;
      for (i=0;i<ar.length;i++){
         r = r+ar[i];
      }
      return r/ar.length;
   }
   ax=average(kx);
   ay=average(ky);
   for (i=0;i<kx.length;i++){
      nr = nr + ((kx[i]-ax) * (ky[i]-ay));
      dr = dr + ((kx[i]-ax)*(kx[i]-ax))
   }
  b=nr/dr;
  a=ay-b*ax;
  return (a+b*x);
}

$(function(){
	if ($('.modalFW[data-name="homeVideo"').length) {
		var modalVideo = $('.modalFW[data-name="homeVideo"').modalFW('get');
		modalVideo.onOpen = function(){
			this.$el.find('video').get(0).play();
		};
		modalVideo.onClose = function(){
			this.$el.find('video').get(0).pause();
		};
	}

	if ($('form[data-form="form_rekentool_2"]').length) {
		var debug,tests;
		debug = true;
		// tests = true;
		// constantes
		const gasPrice             = 0.0792;
		const PI                   = Math.PI;

		// calculs
		var tuit, lambda, thermalResistance,powerLossConvection,powerLossRadiation,powerLossTotalA;
		var between,balance,powerLossA,powerLossB,powerLossTotalB,r1,r2,powerGain,energySavings,savings;
		var H, K, characteristicLength, zhu, PR, V, velocity, Re, Nu_L, Nu_D, C, Re, M, zhu;
		var energySavings, savings, co2Savings, treesPerYear;

		// form
		var insulationLocation, temperature, surface, diameter, length, area, insulationType, insulationThickness;
		var cf;
		var form = $('form[data-form="form_rekentool_2"]').splitForm('get');
		var energySavings_c = form.$el.find('.results .energySavings.countUpFW').countUpFW('get');
		var co2Savings_c = form.$el.find('.results .co2Savings.countUpFW').countUpFW('get');
		var treesPerYear_c = form.$el.find('.results .treesPerYear.countUpFW').countUpFW('get');

		var processVars = function(){
			return new Promise(function(resolve,reject){
				insulationLocation  = cf.inputs.insulationLocation.value;
				temperature         = Number(cf.inputs.temperature.value);
				surface             = cf.inputs.surface.value;
				diameter            = Number(cf.inputs.diameter.value);
				length              = Number(cf.inputs.length.value);
				area                = Number(cf.inputs.area.value);
				insulationType      = cf.inputs.insulationType.value;
				insulationThickness = Number(cf.inputs.insulationThickness.value);
				// console.log(insulationLocation,temperature,surface,diameter,length,area,insulationType,insulationThickness);

				// Tuit
				tuit = (insulationLocation == "inside") ? 20 : 10.2;

				// H
				if (insulationLocation == "inside") {
					H   = 5;
					zhu = 0;
				} else if (insulationLocation == "outside" && surface == "rectangular" ) {
					K                    = 0.024956;
					characteristicLength = 1
					PR                   = 0.711368;
					V                    = 0.0000143948;
					velocity             = 5;
					Re   = velocity * characteristicLength / V;
					Nu_L = 0.0296 * Re**(4/5) * PR**(1/3);
					zhu = 0;
					H    = Nu_L * K / characteristicLength;
				} else if (insulationLocation == "outside" && surface == "cylinder" ) {
					K	      = 	0.024956;
					PR	      = 	0.711368;
					velocity	= 	5;
					V	      = 	0.0000143948;
					Re	      = 	velocity * (diameter/1000) / V;

					if      (Re < 40)    C = 0.75;
					else if (Re < 1000)  C = 0.51;
					else if (Re < 20000) C = 0.26;
					else                 C = 0.076;
					
					if      (Re < 40)    M = 0.4;
					else if (Re < 1000)  M = 0.5;
					else if (Re < 20000) M = 0.6;
					else                 M = 0.7;

					let kelvin = temperature - 273;

					if      (temperature < -23) zhu = "Out of bounds";
					else if (temperature < 27)  zhu = 0.72  + ((temperature- -23) / (27- -23)) * (0.707 - 0.72);
					else if (temperature < 77)  zhu = 0.707 + (((temperature-27)/(77-27))*(0.7-0.707));
					else if (temperature < 127) zhu = 0.7   + (((temperature-77)/(127-77))*(0.69-0.7));
					else if (temperature < 227) zhu = 0.69  + (((temperature-127)/(227-127))*(0.686-0.69));
					else if (temperature < 277) zhu = 0.686 + (((temperature-227)/(277-227))*(0.684-0.686));
					else if (temperature < 327) zhu = 0.684 + (((temperature-277)/(327-277))*(0.683-0.684));
					else                   zhu = "Out of bounds";

					Nu_D = C * Re**M * PR**0.37 * (PR / zhu)**0.24
					H	  = Nu_D * K / (diameter / 1000 )
				}

				// Lambda
				if      (insulationType == "rockwool")  {
					// lambda = forecast(temperature,[0.036, 0.042, 0.053, 0.066, 0.083, 0.125, 0.148],[10,50,100,150,200,300,350])
					lambda = 0.0347 * Math.exp(0.0042 * temperature);
				}
				else if (insulationType == "glasswool") {
					// lambda = forecast(temperature,[0.041,0.053,0.068,0.086,0.107,0.133],[50,100,150,200,250,300])
					lambda = 0.033 * Math.exp(0.0047 * temperature);
				}


				if (surface == "cylinder") 
					thermalResistance = 1 / (H * PI * (diameter / 1000));
				else if (surface == "rectangular") 
					thermalResistance = 1 / H

				powerLossConvection = (temperature - tuit) / thermalResistance;
				// powerLossRadiation
				if (surface == "cylinder") {
					powerLossRadiation = 0.9 * 5.67 * 10**(-8) * (((273 + temperature)**4) -((273 + tuit)**4)) * PI * (diameter / 1000);
					powerLossTotalA = (powerLossConvection + powerLossRadiation) * length;
					r1 = Math.log((diameter + 2 * insulationThickness) / diameter) / (2 * PI * lambda);
					r2 = 1 / (H * PI * (diameter / 1000));
				}
				else if (surface == "rectangular") {
					powerLossRadiation = 0.6 * 5.67 * 10**(-8) * (((273 + temperature)**4) - ((273 + tuit)**4));
					powerLossTotalA = (powerLossConvection + powerLossRadiation) * area;
					r1 = insulationThickness / 1000 / lambda;
					r2 = 1 / H;
				}

				if (debug) {
					console.table({
						'thermalResistance': thermalResistance,
						'powerLossConvection': powerLossConvection,
						'powerLossRadiation': powerLossRadiation,
						'powerLossTotalA': powerLossTotalA,
					});
				}

				// Ttussen / Between
				// Balance
				between = 0;
				// balance = ((temperature - between) / r1) - (0.9 * 5.67 * 10**(-8)) * ((273 + between)**4 - (273 + tuit)**4) - ((between - tuit) / r2);
				balance = 0;
				const fn = (between) => ((temperature - between) / r1) - (0.9 * 5.67 * 10**(-8)) * ((273 + between)**4 - (273 + tuit)**4) - ((between - tuit) / r2);
				const fnParams = [0];
				try {
				  between = goalSeek({
				    fn,
				    fnParams,
				    // percentTolerance: 50,
				    customToleranceFn : (x)=>{
				    	// console.log(x);
				    	return x > balance-0.5 && x < balance+0.5
				    },
				    maxIterations: 10000,
				    maxStep: 0.01,
				    goal: balance,
				    independentVariableIdx: 0
				  });
				  // console.log(`result: ${between}`);
				} catch (e) {
				  // console.log('error', e);
				}

				// Power loss /m A
				// Power loss /m B
				powerLossA = (temperature - between) / r1;
				powerLossB = (between - tuit) / r2;
				// Total Power loss
				if      (surface == "cylinder")    powerLossTotalB = powerLossA * length;
				else if (surface == "rectangular") powerLossTotalB = powerLossA * area;
				// Power gain
				// Energy Savings
				// Savings
				// CO² savings
				// Trees per year
				powerGain     = powerLossTotalA - powerLossTotalB;
				energySavings = powerGain * 8760 / 1000;
				savings       = energySavings * gasPrice;
				co2Savings    = energySavings * 0.198;
				treesPerYear  = co2Savings / 25;

				if (debug) {
					console.table({
						'powerLossA':powerLossA,
						'powerLossB':powerLossB,
						'powerLossTotalA':powerLossTotalA,
						'powerLossTotalB':powerLossTotalB,
						'powerGain':powerGain,
						'energySavings':energySavings,
						'savings':savings,
						'co2Savings':co2Savings,
						'treesPerYear':treesPerYear,
					});
				}


				if (debug) {
					console.table({
							'temperature':temperature,
						   'surface':surface,
						   'insulationLocation':insulationLocation,
						   'insulationType':insulationType,
						   'insulationThickness':insulationThickness,
						   'diameter':diameter,
						   'length':length,
						   'tuit':tuit,
						   'H':H,
						   'lambda':lambda,
						   'Re' :Re,
						   'Nu_D' :Nu_D,
						   'Nu_L' :Nu_L,
						   'r1':r1,
						   'r2':r2,
						   'zhu':zhu,
						   'between':between,
						   'balance':balance,
						}
				  	);
				}


				resolve();
			});
		}
		var processInputs = function(){
			return new Promise(function(resolve,reject){
				//step 1
				if (insulationLocation=='outside') {
					form.hideInput(form.$el.find('[name="temperature"]'),false);
				} else if(insulationLocation=='inside'){
					form.hideInput(form.$el.find('[name="temperature"]'),false);
				}
				// form.$el.find('[name="temperature"]').attr('min',s1).trigger('change');

				//step 3
				if (surface=='cylinder') {
					form.$el.find('.picture--cylinder').removeClass('hidden');
					form.$el.find('.picture--rectangle').addClass('hidden');
					form.hideInput(form.$el.find('[name="diameter"]'),false);
					form.hideInput(form.$el.find('[name="length"]'),false);
					form.hideInput(form.$el.find('[name="area"]'),true);
				} else if(surface=='rectangular'){
					form.$el.find('.picture--rectangle').removeClass('hidden');
					form.$el.find('.picture--cylinder').addClass('hidden');
					form.hideInput(form.$el.find('[name="diameter"]'),true);
					form.hideInput(form.$el.find('[name="length"]'),true);
					form.hideInput(form.$el.find('[name="area"]'),false);
				}

				//step 4
				form.$el.find('[name="energySavings"]').val(Number(Number(energySavings).toFixed(2)));
				form.$el.find('[name="savings"]').val(Number(Number(savings).toFixed(2)));
				form.$el.find('[name="co2Savings"]').val(Number(Number(co2Savings).toFixed(2)));
				form.$el.find('[name="treesPerYear"]').val(Number(Number(treesPerYear).toFixed(2)));
				// form.$el.find('.results .energySavings .value').html(Number(Number(energySavings).toFixed(2)));
				// form.$el.find('.results .savings .value').html(Number(Number(savings).toFixed(2)));
				// form.$el.find('.results .co2Savings .value').html(Number(Number(co2Savings).toFixed(2)));
				// form.$el.find('.results .treesPerYear .value').html(Number(Number(treesPerYear).toFixed(2)));
				energySavings_c.anim.endVal = energySavings;
				co2Savings_c.anim.endVal = co2Savings;
				treesPerYear_c.anim.endVal = treesPerYear;
				energySavings_c.anim.reset(); energySavings_c.anim.start();
				co2Savings_c.anim.reset(); co2Savings_c.anim.start();
				treesPerYear_c.anim.reset(); treesPerYear_c.anim.start();

				if (
					   temperature<tuit                                      
					|| temperature>300                                       
					|| insulationThickness<30                                
					|| insulationThickness>100                              
					|| (insulationType == "glasswool" && temperature > 300) 
					|| (insulationType == "rockwool" && temperature > 350)
					|| zhu == "Out of bounds"
				) {
					// form.hideInput(form.$el.find('[name="email"]'),false);
					form.$el.find('.10b').removeClass('hidden');
					form.$el.find('.results').addClass('hidden');
				} else {
					// form.hideInput(form.$el.find('[name="email"]'),true);
					form.$el.find('.10b').addClass('hidden');
					form.$el.find('.results').removeClass('hidden');
				}
				form.$el.find('.legal_notice_2').addClass('hidden');
				if (form.$sections.last().hasClass('active'))
					form.$el.find('.legal_notice_2').removeClass('hidden');
			    
			    resolve();
			});
		}
		var updateForm = function(){
			cf = utils.checkForm(form.$el,false);
			processVars().then(() => processInputs())
		}

		// form initial setup
		form.$el.find('input,select,textarea').not('[name=email]').attr('required',true)
		form.$el.find('[required]').attr('data-required',true);
		form.$el.find('img[src*="[lang]"]').each(function(){
			this.src = this.src.replace('[lang]',document.querySelector('html').getAttribute('lang'));
		});
		// form.hideInput(form.$el.find('[name="temperature"]'));
		form.hideInput(form.$el.find('[name="diameter"]'));
		form.hideInput(form.$el.find('[name="length"]'));
		form.hideInput(form.$el.find('[name="area"]'));
		form.$el.find('.legal_notice_2').addClass('hidden');
		form.$el.find('[name="insulationLocation"],[name="surface"]').on('change',updateForm);
		form.onNext = updateForm;
		form.onPrev = updateForm;
		form.onFinal = function(){form.$el.submit(); };

		if (debug && tests) {
			// test run
			// step 1
			// insulationLocation
			form.$el.find('[name="insulationLocation"]').first().next('label').trigger('click') // outside / buiten
			form.$el.find('[name="insulationLocation"]').last().next('label').trigger('click') // inside / binnen
			form.$el.find('[name="temperature"]').val('270').trigger('change');
			form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

			// // step2
			// surface
			form.$el.find('[name="surface"]').first().next('label').trigger('click') // cylinder
			form.$el.find('[name="surface"]').last().next('label').trigger('click') // rectangular
			form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

			// // // step3
			form.$el.find('[name="diameter"]').val('100').trigger('change');
			form.$el.find('[name="length"]').val('1').trigger('change');
			form.$el.find('[name="area"]').val('1').trigger('change');
			// insulationType
			form.$el.find('[name="insulationType"]').first().next('label').trigger('click') // glasswool
			form.$el.find('[name="insulationType"]').last().next('label').trigger('click') // rockwool
			form.$el.find('[name="insulationThickness"]').val('100').trigger('change');
			form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');
		}
	}

	// if ($('form[data-form="form_rekentool"]').length) {
	// 	var c1 = 8760;
	// 	var c2 = 0.10;
	// 	var c3 = 0.3;
	// 	var c4 = 25;
	// 	var c5 = 0.05;
	// 	var s1, s2, v1, v2, v3, v4, v5, v6, v7, v8, v9, r1, r2, r3, r4;
	// 	var q1, q3, q4, q5, q6, q7, q8, q9;
	// 	var cf;
	// 	var form = $('form[data-form="form_rekentool"]').splitForm('get');
	// 	var r1_c = form.$el.find('.results .r1.countUpFW').countUpFW('get');
	// 	var r3_c = form.$el.find('.results .r3.countUpFW').countUpFW('get');
	// 	var r4_c = form.$el.find('.results .r4.countUpFW').countUpFW('get');

	// 	var processVars = function(){
	// 		return new Promise(function(resolve,reject){
	// 			q1  = cf.inputs.q1.value;
	// 			// q2a = Number(cf.inputs.q2a.value);
	// 			// q2b = Number(cf.inputs.q2b.value);
	// 			q3  = Number(cf.inputs.q3.value);
	// 			c5  = forecast(q3,[0.035,0.043,0.049,0.056,0.066,0.090],[10,50,100,150,200,300])
	// 			if (c5<0.035) c5 = 0.035;
	// 			if (c5>0.090) c5 = 0.090;
	// 			// console.log(c5);

	// 			q4  = cf.inputs.q4.value;
	// 			q5  = Number(cf.inputs.q5.value);
	// 			q6  = Number(cf.inputs.q6.value);
	// 			q7  = Number(cf.inputs.q7.value);
	// 			// q8  = Number(cf.inputs.q8.value);
	// 			q9  = Number(cf.inputs.q9.value);
	// 			// console.log(q1,q3,q4,q5,q6,q7,q8,q9);

	// 			s1 = ('outside' === q1) ? 10 : 17;
	// 			s2 = ('outside' === q1) ? 35 : 5;

	// 			v1 = ('cylinder' === q4) ? (1 / (s2 * Math.PI * (q5 / 1000))) : (1 / s2);
	// 			v2 = (q3 - s1) / v1;
	// 			v3 = ('cylinder' === q4) ? (v2 * (q6 / 1000)) : (v2 * q7);
	// 			v4 = ('cylinder' === q4) ? (Math.log((q5 + 2 * q9) / q5) / (2 * Math.PI * c5)) : ((q9 / 1000) / c5);
	// 			v5 = ('cylinder' === q4) ? (1 / (s2 * Math.PI * q5 / 1000)) : v1;
	// 			v6 = (v5 * q3 + v4 * s1) / (v4 + v5);
	// 			v7 = (q3 - v6) / v4;
	// 			v8 = ('cylinder' === q4) ? (v7 * q6 / 1000) : (v7 * q7);
	// 			v9 = v3 - v8;
	// 			// console.log(v1,v2,v3,v4,v5,v6,v7,v8,v9);

	// 			r1 = c1 / 1000 * v9;
	// 			r2 = c2 * r1;
	// 			r3 = c3 * r1;
	// 			r4 = Math.floor(r3 / c4);
	// 			// console.log(r1,r2,r3,r4);

	// 			resolve();
	// 		});
	// 	}
	// 	var processInputs = function(){
	// 		return new Promise(function(resolve,reject){
	// 			//step 1
	// 			if (q1=='outside') {
	// 				// form.hideInput(form.$el.find('[name="q2a"]'),false);
	// 				// form.hideInput(form.$el.find('[name="q2b"]'),true);
	// 				form.hideInput(form.$el.find('[name="q3"]'),false);
	// 			} else if(q1=='inside'){
	// 				// form.hideInput(form.$el.find('[name="q2a"]'),true);
	// 				// form.hideInput(form.$el.find('[name="q2b"]'),false);
	// 				form.hideInput(form.$el.find('[name="q3"]'),false);
	// 			}
	// 			// form.$el.find('[name="q3"]').attr('min',s1).trigger('change');

	// 			//step 3
	// 			if (q4=='cylinder') {
	// 				form.$el.find('.picture--cylinder').removeClass('hidden');
	// 				form.$el.find('.picture--rectangle').addClass('hidden');
	// 				form.hideInput(form.$el.find('[name="q5"]'),false);
	// 				form.hideInput(form.$el.find('[name="q6"]'),false);
	// 				form.hideInput(form.$el.find('[name="q7"]'),true);
	// 			} else if(q4=='rectangle'){
	// 				form.$el.find('.picture--rectangle').removeClass('hidden');
	// 				form.$el.find('.picture--cylinder').addClass('hidden');
	// 				form.hideInput(form.$el.find('[name="q5"]'),true);
	// 				form.hideInput(form.$el.find('[name="q6"]'),true);
	// 				form.hideInput(form.$el.find('[name="q7"]'),false);
	// 			}

	// 			//step 4
	// 			form.$el.find('[name="r1"]').val(Number(Number(r1).toFixed(2)));
	// 			form.$el.find('[name="r2"]').val(Number(Number(r2).toFixed(2)));
	// 			form.$el.find('[name="r3"]').val(Number(Number(r3).toFixed(2)));
	// 			form.$el.find('[name="r4"]').val(Number(Number(r4).toFixed(2)));
	// 			// form.$el.find('.results .r1 .value').html(Number(Number(r1).toFixed(2)));
	// 			// form.$el.find('.results .r2 .value').html(Number(Number(r2).toFixed(2)));
	// 			// form.$el.find('.results .r3 .value').html(Number(Number(r3).toFixed(2)));
	// 			// form.$el.find('.results .r4 .value').html(Number(Number(r4).toFixed(2)));
	// 			r1_c.anim.endVal = r1;
	// 			r3_c.anim.endVal = r3;
	// 			r4_c.anim.endVal = r4;
	// 			r1_c.anim.reset(); r1_c.anim.start();
	// 			r3_c.anim.reset(); r3_c.anim.start();
	// 			r4_c.anim.reset(); r4_c.anim.start();
				
	// 			// if (q2a == 1 || q2b == 1 || q8 == 1) {
	// 			if (q3<s1 || q3>300 || q9<30 || q9>100) {
	// 				// form.hideInput(form.$el.find('[name="email"]'),false);
	// 				form.$el.find('.10b').removeClass('hidden');
	// 				form.$el.find('.results').addClass('hidden');
	// 			} else {
	// 				// form.hideInput(form.$el.find('[name="email"]'),true);
	// 				form.$el.find('.10b').addClass('hidden');
	// 				form.$el.find('.results').removeClass('hidden');
	// 			}
	// 			form.$el.find('.legal_notice_2').addClass('hidden');
	// 			if (form.$sections.last().hasClass('active'))
	// 				form.$el.find('.legal_notice_2').removeClass('hidden');

			    
	// 		    resolve();
	// 		});
	// 	}
	// 	var updateForm = function(){
	// 		cf = utils.checkForm(form.$el,false);
	// 		processVars().then(() => processInputs())
	// 	}

	// 	// form initial setup
	// 	form.$el.find('input,select,textarea').not('[name=email]').attr('required',true)
	// 	form.$el.find('[required]').attr('data-required',true);
	// 	form.$el.find('img[src*="[lang]"]').each(function(){
	// 		this.src = this.src.replace('[lang]',document.querySelector('html').getAttribute('lang'));
	// 	});
	// 	// form.hideInput(form.$el.find('[name="q2a"]'));
	// 	// form.hideInput(form.$el.find('[name="q2b"]'));
	// 	// form.hideInput(form.$el.find('[name="q3"]'));
	// 	form.hideInput(form.$el.find('[name="q5"]'));
	// 	form.hideInput(form.$el.find('[name="q6"]'));
	// 	form.hideInput(form.$el.find('[name="q7"]'));
	// 	form.$el.find('.legal_notice_2').addClass('hidden');
	// 	form.$el.find('[name="q1"],[name="q4"]').on('change',updateForm);
	// 	form.onNext = updateForm;
	// 	form.onPrev = updateForm;
	// 	form.onFinal = function(){form.$el.submit(); };


	// 	// test run
	// 	// step 1
	// 	// form.$el.find('label#lbl_85_0').trigger('click')
	// 	// form.$el.find('[name="q3"]').val('25').trigger('change');
	// 	// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

	// 	// // step2
	// 	// form.$el.find('label#lbl_90_0').trigger('click')
	// 	// form.$el.find('label#lbl_90_1').trigger('click')
	// 	// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

	// 	// // // step3
	// 	// form.$el.find('[name="q5"]').val('25').trigger('change');
	// 	// form.$el.find('[name="q6"]').val('25').trigger('change');
	// 	// form.$el.find('[name="q7"]').val('0.5').trigger('change');
	// 	// form.$el.find('label#lbl_123_0').trigger('click')
	// 	// form.$el.find('label#lbl_123_1').trigger('click')
	// 	// form.$el.find('[name="q9"]').val('50').trigger('change');
	// 	// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');
	// }
});

const observer = new IntersectionObserver((entries)=>{
	entries.forEach((entry)=>{
		// console.log(entry)
		if (entry.isIntersecting) {
			entry.target.classList.add('show')
		} else {
			entry.target.classList.remove('show')
		}
	})
});

const animateElements = document.querySelectorAll('[class*=animate--]');
animateElements.forEach((el)=> observer.observe(el));

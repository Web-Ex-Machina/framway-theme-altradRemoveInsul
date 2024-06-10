document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");
app.labels.errors.inputs.empty.nl     = 'Vul het veld "%s" in';
app.labels.errors.inputs.incorrect.nl = 'De waarde die is ingevoerd in het veld "%s" is onjuist';
app.labels.buttons.next.nl            = 'Volgende';
app.labels.buttons.prev.nl            = 'Vorige';
app.labels.buttons.send.nl            = 'Versturen';
app.labels.miscs.seeMore.nl           = 'Meer informatie';

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


	if ($('form[data-form="form_rekentool"]').length) {
		var c1 = 8760;
		var c2 = 0.10;
		var c3 = 0.3;
		var c4 = 25;
		var c5 = 0.05;
		var s1, s2, v1, v2, v3, v4, v5, v6, v7, v8, v9, r1, r2, r3, r4;
		var q1, q3, q4, q5, q6, q7, q8, q9;
		var cf;
		var form = $('form[data-form="form_rekentool"]').splitForm('get');
		var r1_c = form.$el.find('.results .r1.countUpFW').countUpFW('get');
		var r3_c = form.$el.find('.results .r3.countUpFW').countUpFW('get');
		var r4_c = form.$el.find('.results .r4.countUpFW').countUpFW('get');

		var processVars = function(){
			return new Promise(function(resolve,reject){
				q1  = cf.inputs.q1.value;
				// q2a = Number(cf.inputs.q2a.value);
				// q2b = Number(cf.inputs.q2b.value);
				q3  = Number(cf.inputs.q3.value);
				q4  = cf.inputs.q4.value;
				q5  = Number(cf.inputs.q5.value);
				q6  = Number(cf.inputs.q6.value);
				q7  = Number(cf.inputs.q7.value);
				// q8  = Number(cf.inputs.q8.value);
				q9  = Number(cf.inputs.q9.value);
				// console.log(q1,q3,q4,q5,q6,q7,q8,q9);

				s1 = ('outside' === q1) ? 10 : 17;
				s2 = ('outside' === q1) ? 35 : 5;

				v1 = ('cylinder' === q4) ? (1 / (s2 * Math.PI * (q5 / 1000))) : (1 / s2);
				v2 = (q3 - s1) / v1;
				v3 = ('cylinder' === q4) ? (v2 * (q6 / 1000)) : (v2 * q7);
				v4 = ('cylinder' === q4) ? (Math.log((q5 + 2 * q9) / q5) / (2 * Math.PI * c5)) : ((q9 / 1000) / c5);
				v5 = ('cylinder' === q4) ? (1 / (s2 * Math.PI * q5 / 1000)) : v1;
				v6 = (v5 * q3 + v4 * s1) / (v4 + v5);
				v7 = (q3 - v6) / v4;
				v8 = ('cylinder' === q4) ? (v7 * q6 / 1000) : (v7 * q7);
				v9 = v3 - v8;
				// console.log(v1,v2,v3,v4,v5,v6,v7,v8,v9);

				r1 = c1 / 1000 * v9;
				r2 = c2 * r1;
				r3 = c3 * r1;
				r4 = Math.floor(r3 / c4);
				// console.log(r1,r2,r3,r4);

				resolve();
			});
		}
		var processInputs = function(){
			return new Promise(function(resolve,reject){
				//step 1
				if (q1=='outside') {
					// form.hideInput(form.$el.find('[name="q2a"]'),false);
					// form.hideInput(form.$el.find('[name="q2b"]'),true);
					form.hideInput(form.$el.find('[name="q3"]'),false);
				} else if(q1=='inside'){
					// form.hideInput(form.$el.find('[name="q2a"]'),true);
					// form.hideInput(form.$el.find('[name="q2b"]'),false);
					form.hideInput(form.$el.find('[name="q3"]'),false);
				}
				// form.$el.find('[name="q3"]').attr('min',s1).trigger('change');

				//step 3
				if (q4=='cylinder') {
					form.$el.find('.picture--cylinder').removeClass('hidden');
					form.$el.find('.picture--rectangle').addClass('hidden');
					form.hideInput(form.$el.find('[name="q5"]'),false);
					form.hideInput(form.$el.find('[name="q6"]'),false);
					form.hideInput(form.$el.find('[name="q7"]'),true);
				} else if(q4=='rectangle'){
					form.$el.find('.picture--rectangle').removeClass('hidden');
					form.$el.find('.picture--cylinder').addClass('hidden');
					form.hideInput(form.$el.find('[name="q5"]'),true);
					form.hideInput(form.$el.find('[name="q6"]'),true);
					form.hideInput(form.$el.find('[name="q7"]'),false);
				}

				//step 4
				form.$el.find('[name="r1"]').val(Number(Number(r1).toFixed(2)));
				form.$el.find('[name="r2"]').val(Number(Number(r2).toFixed(2)));
				form.$el.find('[name="r3"]').val(Number(Number(r3).toFixed(2)));
				form.$el.find('[name="r4"]').val(Number(Number(r4).toFixed(2)));
				// form.$el.find('.results .r1 .value').html(Number(Number(r1).toFixed(2)));
				// form.$el.find('.results .r2 .value').html(Number(Number(r2).toFixed(2)));
				// form.$el.find('.results .r3 .value').html(Number(Number(r3).toFixed(2)));
				// form.$el.find('.results .r4 .value').html(Number(Number(r4).toFixed(2)));
				r1_c.anim.endVal = r1;
				r3_c.anim.endVal = r3;
				r4_c.anim.endVal = r4;
				r1_c.anim.reset(); r1_c.anim.start();
				r3_c.anim.reset(); r3_c.anim.start();
				r4_c.anim.reset(); r4_c.anim.start();
				
				// if (q2a == 1 || q2b == 1 || q8 == 1) {
				if (q3<s1 || q3>300 || q9<30 || q9>100) {
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
		// form.hideInput(form.$el.find('[name="q2a"]'));
		// form.hideInput(form.$el.find('[name="q2b"]'));
		// form.hideInput(form.$el.find('[name="q3"]'));
		form.hideInput(form.$el.find('[name="q5"]'));
		form.hideInput(form.$el.find('[name="q6"]'));
		form.hideInput(form.$el.find('[name="q7"]'));
		form.$el.find('.legal_notice_2').addClass('hidden');
		form.$el.find('[name="q1"],[name="q4"]').on('change',updateForm);
		form.onNext = updateForm;
		form.onPrev = updateForm;
		form.onFinal = function(){form.$el.submit(); };


		// test run
		// step 1
		// form.$el.find('label#lbl_85_0').trigger('click')
		// form.$el.find('[name="q3"]').val('25').trigger('change');
		// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

		// // step2
		// form.$el.find('label#lbl_90_0').trigger('click')
		// form.$el.find('label#lbl_90_1').trigger('click')
		// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');

		// // // step3
		// form.$el.find('[name="q5"]').val('25').trigger('change');
		// form.$el.find('[name="q6"]').val('25').trigger('change');
		// form.$el.find('[name="q7"]').val('0.5').trigger('change');
		// form.$el.find('label#lbl_123_0').trigger('click')
		// form.$el.find('label#lbl_123_1').trigger('click')
		// form.$el.find('[name="q9"]').val('50').trigger('change');
		// form.$el.find('.splitForm__action[data-dir="next"]').trigger('click');
	}
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

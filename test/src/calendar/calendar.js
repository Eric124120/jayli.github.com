

/**
 * author - lijing00333@163.com 拔赤
 * 
 * calendar 包含calendar calendar-page和calendar-timer 三个子模块
 */


KISSY.add('calendar',function(S){

	S.namespace('S.Calendar');
	var _proto = S.Calendar.prototype;
	S.Calendar = function(){
		this._init.apply(this,arguments);
	};
	S.mix(S.Calendar.prototype,_proto);
	S.mix(S.Calendar.prototype,{
		_init:function(id,config){
			var self = this;
			self.id = self.C_Id = id;
			self._buildParam(config);
			/*
				self.con，日历的容器
				self.id   传进来的id
				self.C_Id 永远代表日历容器的ID
			*/
			if(!self.popup){
				self.con = S.one('#'+id);
			} else {
				var trigger = S.one('#'+id);
				self.trigger = trigger;
				self.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
				self.con = S.Node('<div id="'+self.C_Id+'"></div>');
				S.one('body').append(self.con);
				self.con.css({
					'top':'0px',
					'position':'absolute',
					'background':'white',
					'visibility':'hidden'
				});
			}
			
			//创建事件中心
			//事件中心已经和Calendar合并
			var EventFactory = new Function;
			S.augment(EventFactory, S.EventTarget);
			var eventCenter = new EventFactory();
			S.mix(self,eventCenter);

			self.render();
			self._buildEvent();
			return this;
		},

		render:function(o){
			var self = this,
				o = o || {},
				i = 0,
				_prev,_next,_oym;

			self._parseParam(o);
			self.ca = [];

			self.con.addClass('ks-cal-call ks-clearfix multi-'+self.pages);
			self.con.html('');

			for(i = 0,_oym = [self.year,self.month]; i<self.pages;i++){
				if(i == 0){
					_prev = true;
				}else{
					_prev = false;
					_oym = self._computeNextMonth(_oym);
				}
				if(i == (self.pages - 1)){
					_next = true;
				}else {
					_next = false;	
				}
				self.ca.push(new self.Page({
					year:_oym[0],
					month:_oym[1],
					prev_arrow:_prev,
					next_arrow:_next,
					showTime:self.showTime
				},self));

					
				self.ca[i].render();
			}
			return this;

		},
		/**
		 * 计算d天的前几天或者后几天，返回date
		 */
		_showdate:function(n,d){
			var uom = new Date(d-0+n*86400000);
			uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
			return new Date(uom);
		},
		/**
		 * 创建日历外框的事件
		 */
		_buildEvent:function(){
			var self = this;
			if(!self.popup)return this;
			//点击空白
			//flush event
			for(var i = 0;i<self.EV.length;i++){
				if(typeof self.EV[i] != 'undefined'){
					self.EV[i].detach();
				}
			}
			self.EV[0] = S.one('body').on('click',function(e){
				//TODO e.target是裸的节点，这句不得不加，虽然在逻辑上并无特殊语义
				e.target = S.Node(e.target);
				//点击到日历上
				if(e.target.attr('id') == self.C_Id)return;
				if((e.target.hasClass('next')||e.target.hasClass('prev'))
					&& e.target[0].tagName == 'A')	return;
				//点击在trigger上
				if(e.target.attr('id') == self.id)return;
				if(!S.DOM.contains(S.one('#'+self.C_Id),e.target)){
					self.hide();
				}
			});
			//点击触点	
			for(var i = 0;i<self.triggerType.length;i++){
				
				self.EV[1] = S.one('#'+self.id).on(self.triggerType[i],function(e){
					e.target = S.Node(e.target);
					e.preventDefault();
					//如果focus和click同时存在的hack
					S.log(e.type);
					var a = self.triggerType;
					if(S.inArray('click',a) && S.inArray('focus',a)){//同时含有
						if(e.type == 'focus'){
							self.toggle();
						}
					}else if(S.inArray('click',a) && !S.inArray('focus',a)){//只有click
						if(e.type == 'click'){
							self.toggle();
						}
					}else if(!S.inArray('click',a) && S.inArray('focus',a)){//只有focus
						setTimeout(function(){//为了跳过document.onclick事件
							self.toggle();
						},170);
					}else {
						self.toggle();
					}
						
				});

			}
			return this;
		},
		toggle:function(){
			var self = this;
			if(self.con.css('visibility') == 'hidden'){
				self.show();
			}else{
				self.hide();
			}
		},


		/**
		 * 显示 
		 */
		show:function(){
			var self = this;
			self.con.css('visibility','');
			var _x = self.trigger.offset().left,
			//KISSY得到DOM的width是innerWidth，这里期望得到outterWidth
				height = self.trigger[0].offsetHeight || self.trigger.height(),
				_y = self.trigger.offset().top+height;
			self.con.css('left',_x.toString()+'px');
			self.con.css('top',_y.toString()+'px');
			return this;
		},
		/**
		 * 隐藏 
		 */
		hide:function(){
			var self = this;
			self.con.css('visibility','hidden');
			return this;
		},
		/**
		 * 创建参数列表
		 */
		_buildParam:function(o){
			var self = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			//null在这里是“占位符”，用来清除参数的一个道具
			self.date = (typeof o.date == 'undefined' || o.date == null)?new Date():o.date;
			self.selected = (typeof o.selected == 'undefined' || o.selected == null)?self.date:o.selected;
			self.startDay = (typeof o.startDay == 'undefined' || o.startDay == null)?(7-7):(7-o.startDay)%7;//1,2,3,4,5,6,7
			self.pages = (typeof o.pages == 'undefined' || o.pages == null)?1:o.pages;
			self.closable = (typeof o.closable == 'undefined' || o.closable == null)?false:o.closable;
			self.rangeSelect = (typeof o.rangeSelect == 'undefined' || o.rangeSelect == null)?false:o.rangeSelect;
			self.minDate = (typeof o.minDate == 'undefined' || o.minDate == null)?false:o.minDate;
			self.maxDate = (typeof o.maxDate == 'undefined' || o.maxDate == null)?false:o.maxDate;
			self.multiSelect = (typeof o.multiSelect== 'undefined' || o.multiSelect == null)?false:o.multiSelect;
			self.navigator = (typeof o.navigator == 'undefined' || o.navigator == null)?true:o.navigator;
			self.arrow_left = (typeof o.arrow_left == 'undefined' || o.arrow_left == null)?false:o.arrow_left;
			self.arrow_right = (typeof o.arrow_right == 'undefined' || o.arrow_right == null)?false:o.arrow_right;
			self.popup = (typeof o.popup == 'undefined' || o.popup== null)?false:o.popup;
			self.showTime = (typeof o.showTime == 'undefined' || o.showTime == null)?false:o.showTime;
			self.triggerType = (typeof o.triggerType == 'undefined' || o.triggerType == null)?['click']:o.triggerType;
			if(typeof o.range != 'undefined' && o.range != null){
				var s = self._showdate(1,new Date(o.range.start.getFullYear()+'/'+(o.range.start.getMonth()+1)+'/'+(o.range.start.getDate())));
				var e = self._showdate(1,new Date(o.range.end.getFullYear()+'/'+(o.range.end.getMonth()+1)+'/'+(o.range.end.getDate())));
				self.range = {
					start:s,
					end:e
				};
			}else {
				self.range = {
					start:null,
					end:null
				};
			}
			self.EV = [];
			return this;
		},

		/**
		 * 过滤参数列表
		 */
		_parseParam:function(o){
			var self = this,i;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(i in o){
				self[i] = o[i];
			}
			self._handleDate();
			return this;
		},

		/**
		 * 模板函数 
		 */
		_templetShow : function(templet, data){
			var self = this,str_in,value_s,i,par;
			if(data instanceof Array){
				str_in = '';
				for(var i = 0;i<data.length;i++){
					str_in += arguments.callee(templet,data[i]);
				}
				templet = str_in;
			}else{
				value_s = templet.match(/{\$(.*?)}/g);
				if(data !== undefined && value_s != null){
					for(i=0, m=value_s.length; i<m; i++){
						par = value_s[i].replace(/({\$)|}/g, '');
						value = (data[par] !== undefined) ? data[par] : '';
						templet = templet.replace(value_s[i], value);
					}
				}
			}
			return templet;
		},
		/**
		 * 处理日期
		 */
		_handleDate:function(){
			var self = this
				date = self.date;
			self.weekday= date.getDay() + 1;//星期几 //指定日期是星期几
			self.day = date.getDate();//几号
			self.month = date.getMonth();//月份
			self.year = date.getFullYear();//年份
			return this;
		},
		//get标题
		_getHeadStr:function(year,month){
			return year.toString() + '年' + (Number(month)+1).toString() + '月';
		},
		//月加
		_monthAdd:function(){
			var self = this;
			if(self.month == 11){
				self.year++;
				self.month = 0;
			}else{
				self.month++;
			}
			self.date = new Date(self.year.toString()+'/'+(self.month+1).toString()+'/'+self.day.toString());
			return this;
		},
		//月减
		_monthMinus:function(){
			var self = this;
			if(self.month == 0){
				self.year-- ;
				self.month = 11;
			}else{
				self.month--;
			}
			self.date = new Date(self.year.toString()+'/'+(self.month+1).toString()+'/'+self.day.toString());
			return this;
		},
		//裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
		_computeNextMonth:function(a){
			var self = this,
				_year = a[0],
				_month = a[1];
			if(_month == 11){
				_year++;
				_month = 0;
			}else{
				_month++;
			}
			return [_year,_month];
		},

		//处理日期的偏移量
		_handleOffset:function(){
			var self = this,
				data= ['日','一','二','三','四','五','六'],
				temp = '<span>{$day}</span>',
				offset = self.startDay,
				day_html = '',
				a = [];
			for(var i = 0;i<7;i++){
				a[i] = {
					day:data[(i-offset+7)%7]
				};
			}
			day_html = self._templetShow(temp,a);

			return {
				day_html:day_html
			};
		},
		//处理起始日期,d:Date类型
		_handleRange : function(d){
			var self = this,t;
			if((self.range.start == null && self.range.end == null )||(self.range.start != null && self.range.end != null)){
				self.range.start = d;
				self.range.end = null;
				self.render();
			}else if(self.range.start != null && self.range.end == null){
				self.range.end = d;
				if(self.range.start.getTime() > self.range.end.getTime()){
					t = self.range.start;
					self.range.start = self.range.end;
					self.range.end = t;
				}
				self.fire('rangeSelect',self.range);
				self.render();
			}
			return this;
		}
		//constructor 
		
		//Page:S._cPage
		
	});//prototype over

	
});

/**
 * 2010-09-09 by lijing00333@163.com - 拔赤
 *	 - 将基于YUI2/3的Calendar改为基于KISSY
 *	 - 增加起始日期（星期x）的自定义
 * 	 - 常见浮层的bugfix
 *
 * TODO:
 *   - 日历日期的输出格式的定制
 *   - 多选日期的场景的交互设计
 */


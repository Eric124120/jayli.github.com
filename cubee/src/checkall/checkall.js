/**
 *		
 * ������� { node:[],nodelist:nodelist}
 */

YUI.namespace('Y.Checkall');
YUI.add('checkall',function(Y){
	Y.Checkall= function(){
		this.init.apply(this,arguments);
	};
	Y.Checkall.prototype = {
		/**
		 * ������
		 */
		init:function(config){
			if(!config){
				throw new Error(100,'û�д������');
				return false;
			}else if(!config.node){
				throw new Error(100,'û�д���node:[]');
				return false;
			}
			var that = this;
			that.node = [];
			that.inverse = [];
			if(config.node instanceof Array){
				that.node = config.node;
			}else{
				that.node.push(config.node);
			}
			that.nodelist = config.nodelist;
			if(config.inverse){
				if(config.inverse instanceof Array){
					that.inverse = config.inverse;
				}else{
					that.inverse.push(config.inverse);
				}
			}
			that.bind();
			that.buildEventCenter();
			return this;
		},
		/**
		 * �¼�����
		 */
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("check");
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		get:function(type){
			var that = this;
			var checked_node_a = [];
			var unchecked_node_a = [];
			that.nodelist.each(function(node){
				if(Y.Node.getDOMNode(node).checked){
					checked_node_a.push(node);
				}else{
					unchecked_node_a.push(node);
				}
			});
			if(type == 'checked'){
				return checked_node_a;
			}else{
				return unchecked_node_a;
			}
		},
		invert:function(){
			var that = this;
			that.nodelist.each(function(node){
				if(!node.get('checked')){
					//δѡ��
					node.set('checked',true);
				}else{
					node.set('checked',false);
				}
			});

		},
		bind:function(){
			var that = this;
			//ȫѡ
			for(var i = 0;i<that.node.length;i++){
				that.node[i].on('click',function(e){
					//e.halt();
					that.synChecklist(e.target);
					that.synCheckall(e);
				});

			}
			//��ѡ
			for(var i = 0;i<that.inverse.length;i++){
				that.inverse[i].on('click',function(e){
					//e.halt();
					that.invert();
					that.synCheckall(e);
				});
			}
			//item��ѡ
			that.nodelist.on('click',function(e){
				//debugger;
				that.synCheckall(e);
			});

		},
		synCheckall:function(e){
			var that = this;
			var flag = true;
			that.nodelist.each(function(node){
				if(!node.get('checked')){
					flag = false;
					return false;
				}else{
					return true;
				}
			});
			for(var i = 0;i<that.node.length;i++){
				that.node[i].set('checked',flag);
			}
			that.EventCenter.fire('check',{
				checked:that.get('checked'),
				unchecked:that.get('unchecked'),
				e:e
			});

		},
		//el�������checkall checkbox
		synChecklist:function(el){
			var that = this;
			var flag = el.get('checked');
			that.nodelist.each(function(node){
				node.set('checked',flag);
			});

		},

		/**
		 * �󶨺��� 
		 */
		on:function(type,foo){
			var that = this;
			that.EventCenter.subscribe(type,foo);
			return this;
		}
	};
});

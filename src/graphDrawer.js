class SocialGraphDrawer extends EventEmitter {

	constructor(opts) {
		super();
		this.opts = opts;
		this.nodes = {};
	}

	init() {
		if (this.inited)
			return;
		this._initGraph();
		this.inited = true;
	}

	loadFriends(idNode) {
		let node = this.nodes[idNode];
		if (node.loaded)
			return;
		if (this.opts.demo) {
			let items = [];
			for (let i = 0; i < 100; i++) {
				items.push(this._genRandomNode());
			}
			node.loaded = true;
			this._render(items, idNode);
		} else {
			VK.api("friends.get", { "user_id": idNode, "fields": "domain,photo_50,photo_200_orig,status" }, (data) => {
				node.loaded = true;
				var res = data.response;
				this._render(res.items, idNode);
			});
		}
	}

	_initGraph() {
		this.graphics = Viva.Graph.View.svgGraphics();

		this.defs = Viva.Graph.svg('defs');
		this.graphics.getSvgRoot().append(this.defs);

		//clip image to circle
		const clippath = Viva.Graph.svg('clipPath')
			.attr('id', 'clip')
			.attr('patternUnits', "userSpaceOnUse");
		const circle = Viva.Graph.svg('circle')
			.attr('cx', '10')
			.attr('cy', '10')
			.attr('r', '10');
		clippath.append(circle);
		this.defs.append(clippath);

		this.graphics.node((node) => {
			const ui = Viva.Graph.svg('g');
			const image = Viva.Graph.svg('image')
				.attr('x', '0')
				.attr('y', '0')
				.attr('height', 20)
				.attr('width', 20)
				.attr('clip-path', "url(#clip)")
				.link(node.data.url);
			ui.append(image);

			image.addEventListener("click", () => {
				this.loadFriends(node.id);
				this.emit("click", this.nodes[node.id]);
			});

			return ui;
		}).placeNode((nodeUI, pos) => {
			// Shift image to let links go to the center:
			nodeUI.attr('transform', 'translate(' + (pos.x - 12) + ',' + (pos.y - 12) + ')');
		});
		this.graph = Viva.Graph.graph();

		const renderer = Viva.Graph.View.renderer(this.graph, {
			graphics: this.graphics
		});

		renderer.run();
		this._loadCurrentProfile();
		this.emit("inited")
	}

	_loadCurrentProfile() {
		if (this.opts.demo) {
			let rndNode = this._genRandomNode();
			this._render([rndNode]);
			this.loadFriends(rndNode.id);
		} else {
			VK.api("users.get", { "fields": "domain,photo_50" }, (data) => {
				var res = data.response;
				this._render(res)
				this.loadFriends(res[0].id);
			});
		}
	}

	_render(nodes, parentNodeId = null) {
		this.graph.beginUpdate();
		for (let node of nodes) {
			//if not rendered
			if (this.nodes[node.id] == null) {
				this.nodes[node.id] = node;
				node.loaded = false;
				this.graph.addNode(node.id, {
					url: node.photo_50,
				});
			}
			if (parentNodeId != null) {
				this.graph.addLink(parentNodeId, node.id);
			}
		}
		this.graph.endUpdate();
	}

	_genRandomNode() {
		return {
			id: Math.random(),
			first_name: 'Tech',
			last_name: 'Starter',
			photo_50: 'https://pp.userapi.com/c624230/v624230989/17aa2/RqnKumU7qAs.jpg',
			photo_200_orig: 'https://pp.userapi.com/c624230/v624230989/17a9f/oeUjadee6Zo.jpg',
			status: 'Test status',
			domain: 'techstarter'
		};
	}
}
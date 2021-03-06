/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class Mre01 {
	private kitItem: MRE.Actor = null;
	private assets: MRE.AssetContainer;
	// attachedObjects is a Map that stores userIds and the attached object
	private attachedObjects = new Map<MRE.Guid, MRE.Actor>();

	constructor(private context: MRE.Context) {
		this.assets = new MRE.AssetContainer(context);
		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.userJoined(user));
		this.context.onUserLeft(user => this.userLeft(user));
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {
		// set up somewhere to store loaded assets (meshes, textures,
		// animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// spawn a copy of a kit item
		// 		this.kitItem = MRE.Actor.CreateFromLibrary(this.context, {
		// 			// the number below is the item's artifact id.
		// 			resourceId: 'artifact:1686600160185942682'});

	}
	private userJoined(user: MRE.User) {
		// uncomment below to attach object on userJoined instead.
		this.attachObject(user.id);
	}
	private userLeft(user: MRE.User) {
		// remove attached object when user leaves, so it isn't orphaned.
		this.removeObject(user.id);
	}

	private attachObject(userId: MRE.Guid){
		// if this.attachedObjects doesn't already include userId
		if(!this.attachedObjects.has(userId)) {
			// add userId to map, value set with attached Actor
			// this example is a pin
			this.attachedObjects.set(userId, MRE.Actor.CreateFromLibrary(this.context, {
				resourceId: "artifact:1686600173028901536",
				actor: {
					attachment: {
						attachPoint: "spine-top",
						userId: userId
					},
					transform: {
						local: {
							scale: {x: 0.45, y: 0.45 , z: 0.45 },
							position: {x: 0.014 , y: -0.4 , z: 0.16 },
							rotation: MRE.Quaternion.FromEulerAngles(-5 * MRE.DegreesToRadians,
																	10 * MRE.DegreesToRadians, 0)
						}
					}
				}
			}));
		}
	}
	private removeObject(userId: MRE.Guid) {
		// if user is stored in map
		if (this.attachedObjects.has(userId)) {
			// destroy the attached actor at key
			this.attachedObjects.get(userId).destroy();
			// delete user's key
			this.attachedObjects.delete(userId);
		}
	}

}

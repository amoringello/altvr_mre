/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
// import { delay } from "./helpers";

/**
 * The main class of this app. All the logic goes here.
 */
export default class Mre01 {
	private assets: MRE.AssetContainer;
	// attachedEarsObjects is a Map that stores userIds and the attached object
	private attachedEarsObjects = new Map<MRE.Guid, MRE.Actor>();
// 	private userIdsList = new Array<MRE.Guid>();
	private attachedHipsObjects = new Map<MRE.Guid, MRE.Actor>();
	private eggsList = new Array<MRE.Actor>();
	private kitEggItem: MRE.Actor = null;
	private kitEarsItem: MRE.Actor = null;
	private kitHipsItem: MRE.Actor = null;
	private objTransform: MRE.ActorTransform;
	private MAX_EGGS = 80;
	private TIMEOUT_MS = 300;

	constructor(private context: MRE.Context) {
		this.assets = new MRE.AssetContainer(context);
		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.userJoined(user));
		this.context.onUserLeft(user => this.userLeft(user));
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started = async() => {
		let hipsPosition: MRE.Vector3;
		let hipsRotation: MRE.Quaternion;
		let userIndex = 0;
		let userID: MRE.Guid;

		console.log("[=] Started... MAX_EGGS = " + this.MAX_EGGS)
		this.assets = new MRE.AssetContainer(this.context);
		for (;;) {
			// wait one second
			await this.delay(this.TIMEOUT_MS);

			//
			// find random user UI from attachedEarsObjects dictionary
			//
			let userIdsList = Array.from(this.attachedEarsObjects.keys());  // update in case someone joined or left
			let userListLen = userIdsList.length;
			userIndex = ++userIndex % userListLen;  // count up, but wrap when too many
			userID = userIdsList[userIndex];  // Get the indexed user id

// 			for (let userID of Array.from(this.attachedEarsObjects.keys()) ){
			this.kitHipsItem = this.attachedHipsObjects.get(userID);
			hipsPosition = this.kitHipsItem.transform.app.position;
			hipsRotation = this.kitHipsItem.transform.app.rotation;
			// createfromlibrary (egg)
			this.kitEggItem = MRE.Actor.CreateFromLibrary(this.context, {
				resourceId: 'artifact:1686600160185942682',
				actor: {
					transform: {
						local: {
							scale: {x: 1.0, y: 1.0 , z: 1.0 },
							position: {x :hipsPosition['x'],
								y: hipsPosition['y'],
								z: hipsPosition['z'] + 0.1,
								},
							rotation: hipsRotation,
						}  // local:
					}  // transform:
				}  // actor:
			});  // CreateFromlibrary
			// add to eggsList
			this.eggsList.push(this.kitEggItem);
			// if more than 20 in eggsList, remove first item
			if (this.eggsList.length > this.MAX_EGGS) {
				if (this.eggsList[0]){
					this.eggsList[0].destroy();
				}  // (this.eggsList[0])
				// Remove first item (shift left)
				this.eggsList.shift();
			}  // if (this.eggsList.length > this.MAX_EGGS)
//			}  // foreach
		}  // for(;;)
	}  // started()

	private userJoined(user: MRE.User) {
		// uncomment below to attach object on userJoined instead.
		this.attachObject(user.id);
	}
	private userLeft(user: MRE.User) {
		// remove attached object when user leaves, so it isn't orphaned.
		this.removeObject(user.id);
	}

	private attachObject(userId: MRE.Guid){
		let myEarsObject: MRE.Actor = null;
		let myHipsObject: MRE.Actor = null;
		// if this.attachedEarsObjects doesn't already include userId
		if(!this.attachedEarsObjects.has(userId)) {
			// add userId to map, value set with attached Actor
			// this example is a pin
			console.log("Attaching: " + userId)
			// Attach Ears - not subscribed
			myEarsObject = MRE.Actor.CreateFromLibrary(this.context, {
				// resource ID for ears
				resourceId: "artifact:1686600173028901536",
				actor: {
					attachment: {
						attachPoint: "head",
						userId: userId
					},
					transform: {
						local: {
							scale: {x: 0.45, y: 0.45 , z: 0.45 },
							position: {x: -0.014 , y: -0.6 , z: 0.1 },
							rotation: MRE.Quaternion.FromEulerAngles(-5 * MRE.DegreesToRadians,
								10 * MRE.DegreesToRadians, 0)
						}
					},
				}
			});
			// Attach invisible block at hips - subscribed
			myHipsObject = MRE.Actor.CreatePrimitive(this.assets,
				{
				definition: {
					shape: MRE.PrimitiveShape.Box,
					dimensions: { x: 0.001, y: 0.001, z: 0.001 }
				},
				actor: {
					name: "Receptacle",
					attachment: {
						attachPoint: "hips",
						userId: userId
					},
					transform: {
						local: {
							position: { x: 0.0, y: 0.0, z: 0.0
							}
						}
					},
					subscriptions: [ 'transform' ]
				}
			});
			myEarsObject.subscribe('transform');
			this.attachedEarsObjects.set(userId, myEarsObject);
			this.attachedHipsObjects.set(userId, myHipsObject);
		}
	}
	private removeObject(userId: MRE.Guid) {
		// if user is stored in map
		if (this.attachedEarsObjects.has(userId)) {
			console.log("Destroying: " + userId)

			// destroy the attached actor at key
			this.attachedEarsObjects.get(userId).destroy();
			this.attachedHipsObjects.get(userId).destroy();
			// delete user's key
			this.attachedEarsObjects.delete(userId);
			this.attachedHipsObjects.delete(userId);
		}
	}

	async delay(ms: number) {
		return new Promise(resolve => setTimeout(()=>resolve(), ms));
	}
}

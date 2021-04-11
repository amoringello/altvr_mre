/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { UserSyncFix } from './user-sync-fix'

/**
 * The main class of this app. All the logic goes here.
 */
export default class Mre01 {
	private syncFix = new UserSyncFix(5000);
	private assets: MRE.AssetContainer;
	// attachedEarsObjects is a Map that stores userIds and the attached object
	private attachedEarsObjects = new Map<MRE.Guid, MRE.Actor>();
	// private userIdsList = new Array<MRE.Guid>();
	private attachedHipsObjects = new Map<MRE.Guid, MRE.Actor>();
	private eggsList = new Array<MRE.Actor>();
	private kitEggItem: MRE.Actor = null;
	private kitEarsItem: MRE.Actor = null;
	private kitHipsItem: MRE.Actor = null;
	private objTransform: MRE.ActorTransform;

	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
		this.assets = new MRE.AssetContainer(context);
		this.params = params;
		this.context.onStarted(() => this.started());
		this.context.onUserJoined(user => this.userJoined(user));
		this.context.onUserLeft(user => this.userLeft(user));
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started = async() => {
		let hipsPosition: MRE.Vector3;
		let userIndex = 0;
		let userID: MRE.Guid;
		let MAX_EGGS: number;
		let TIMEOUT_MS: number;

		if (this.params["eggs"]) {
			MAX_EGGS = Number(this.params["eggs"]);
		}
		else { MAX_EGGS = 80; }
		if (this.params["timeout"]) { 
			TIMEOUT_MS = Number(this.params["timeout"]);
		}
		else { TIMEOUT_MS = 500;}

		console.log("[=] Started... MAX_EGGS=" + MAX_EGGS + ", TIMEOUT=" + TIMEOUT_MS)
		this.assets = new MRE.AssetContainer(this.context);
		for (;;) {
			// wait TIMEOUT_MS
			await this.delay(TIMEOUT_MS);

			// find next userID index from attachedEarsObjects dictionary
			let userIdsList = Array.from(this.attachedEarsObjects.keys());
			let userListLen = userIdsList.length;
			if (userListLen === 0) {
				continue;
			}
			userIndex = ++userIndex % userListLen;  // count up, but wrap when too many
			userID = userIdsList[userIndex];  // Get the indexed user id

			this.kitHipsItem = this.attachedHipsObjects.get(userID);
			hipsPosition = this.kitHipsItem.transform.app.position;
			// createfromlibrary (egg)
			this.kitEggItem = MRE.Actor.CreateFromLibrary(this.context, {
				resourceId: 'artifact:1686600160185942682',
				actor: {
					transform: {
						local: {
							scale: {x: 1.0, y: 1.0 , z: 1.0 },
							position: hipsPosition,
						}  // local:
					},  // transform:
					grabbable: true,
				}  // actor:
			});  // CreateFromlibrary

			// add to eggsList
			this.eggsList.push(this.kitEggItem);

			// if more than MAX_EGGS in eggsList, remove first item
			if (this.eggsList.length > MAX_EGGS) {
				if (this.eggsList[0]) {
					this.eggsList[0].destroy();
					this.eggsList.shift();
				}  // (this.eggsList[0])
			}  // if (this.eggsList.length > this.MAX_EGGS)
		}  // for(;;)
	}  // started()

	private userJoined(user: MRE.User) {
		// uncomment below to attach object on userJoined instead.
		this.attachObject(user.id);
		this.syncFix.userJoined();
	}
	private userLeft(user: MRE.User) {
		// remove attached object when user leaves, so it isn't orphaned.
		this.removeObject(user.id);
	}

	private attachObject(userId: MRE.Guid) {
		let myEarsObject: MRE.Actor = null;
		let myHipsObject: MRE.Actor = null;
		// if this.attachedEarsObjects doesn't already include userId
		if( !this.attachedEarsObjects.has(userId) ) {
			// add userId to map, value set with attached Actor
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
							position: {x: 0.01 , y: -0.6 , z: 0.1 },
							rotation: MRE.Quaternion.FromEulerAngles(-5 * MRE.DegreesToRadians,
								10 * MRE.DegreesToRadians, 0)
						}
					},
				}
			});
			this.attachedEarsObjects.set(userId, myEarsObject);

			// Attach invisible block at hips - subscribed
			myHipsObject = MRE.Actor.CreatePrimitive(this.assets, {
				definition: {
					shape: MRE.PrimitiveShape.Box,
					dimensions: { x: 0.001, y: 0.001, z: 0.001 }
				},
				actor: {
					name: "Receptacle",
					attachment: {
						attachPoint: "spine-bottom",
						userId: userId
					},
					transform: {
						local: {
							position: { x: 0.0, y: -0.1, z: -0.2 }
						}
					},
					subscriptions: [ 'transform' ],
				}
			});
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
		return new Promise<void>(resolve => setTimeout(()=>resolve(), ms));
	}
}

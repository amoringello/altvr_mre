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
	// attachedObjects is a Map that stores userIds and the attached object
	private attachedObjects = new Map<MRE.Guid, MRE.Actor>();
	private eggsList = new Array<MRE.Actor>();
	private kitEggItem: MRE.Actor = null;
	private kitEarsItem: MRE.Actor = null;
	private objTransform: MRE.ActorTransform;

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
		// set up somewhere to store loaded assets (meshes, textures,
		// animations, gltfs, etc.)
		console.log("[=] Started...")
		this.assets = new MRE.AssetContainer(this.context);
		// spawn a copy of a kit item
		// 		this.kitEggItem = MRE.Actor.CreateFromLibrary(this.context, {
		// 			// the number below is the item's artifact id.
		// 			resourceId: 'artifact:1686600160185942682'});
		for (;;) {
			// wait one second
			// setTimeout(() => {this.router.navigate(['/']);}, 1000);
			// console.log("[=] Waiting...")
			await this.delay(1000);
			// find random user UI from attachedobjects dictionary
			for (let userID of Array.from(this.attachedObjects.keys()) ){
				console.log("[=] UserID: " + userID )
				this.kitEarsItem = this.attachedObjects.get(userID);
// 				this.objTransform = {
// 					local: {
// 						position: this.kitEarsItem.transform.local.position
// 					},
// 				};
				// createfrom lirary (egg)
				this.kitEggItem = MRE.Actor.CreateFromLibrary(this.context, {
					resourceId: 'artifact:1686600160185942682',
					actor: {
// 						attachment: {
// 							attachPoint: "spine-bottom",
// 							userId: userID
// 						},
// 						transform: this.objTransform,
						transform: {
							local: {
								scale: {x: 1.0, y: 1.0 , z: 1.0 },
								position: this.kitEarsItem.transform.app.position, //{x: 0.014 , y: -0.3 , z: -0.2 },
								rotation: MRE.Quaternion.FromEulerAngles(0, 0, 0)
							}  // local:
						}  // transform:
					}  // actor:
				});  // CreateFromlibrary
				// add to eggsList
// 				console.log("Detaching: " + this.kitEggItem);
// 				this.kitEggItem.detach();
// 				this.kitEggItem.parentId = MRE.ZeroGuid;
				this.eggsList.push(this.kitEggItem);
				// if more than 20 in eggsList, remove first item
				if (this.eggsList.length > 5) {
// 					console.log("Try Destroy " + this.eggsList[0])
					if (this.eggsList[0]){
// 						console.log("Do Destroy " + this.eggsList[0])
						this.eggsList[0].destroy();
					}
					this.eggsList.shift();
// 					console.log("List Len: " + this.eggsList.length)
				}
			}  // foreach
		// });
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
		let myObject: MRE.Actor = null;
		// if this.attachedObjects doesn't already include userId
		if(!this.attachedObjects.has(userId)) {
			// add userId to map, value set with attached Actor
			// this example is a pin
			console.log("Attaching " + userId)
			myObject = MRE.Actor.CreateFromLibrary(this.context, {
				resourceId: "artifact:1686600173028901536",
				actor: {
					attachment: {
						attachPoint: "spine-top",
						userId: userId
					},
					transform: {
						local: {
							scale: {x: 0.45, y: 0.45 , z: 0.45 },
							position: {x: 0.014 , y: -0.4 , z: 0.1 },
							rotation: MRE.Quaternion.FromEulerAngles(-5 * MRE.DegreesToRadians,
								10 * MRE.DegreesToRadians, 0)
						}
					},
					subscriptions: ['transform']
				}
			});
			this.attachedObjects.set(userId, myObject);
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

	async delay(ms: number) {
		return new Promise(resolve => setTimeout(()=>resolve(), ms));
	}
}

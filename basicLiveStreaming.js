let rtc = {
  // For the local audio and video tracks.
  localAudioTrack: null,
  localVideoTrack: null,
  client: null,
}

let options = {
  // Pass your app ID here.
  appId: '',
  // Set the channel name.
  channel: 'POC',
  // Use a temp token
  token: '',
  // Uid
  uid: 1,
}

async function startBasicLiveStreaming() {
  rtc.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })

  window.onload = function () {
    document.getElementById('host-join').onclick = async function () {
      rtc.client.setClientRole('host')
      await rtc.client.join(
        options.appId,
        options.channel,
        options.token,
        options.uid
      )
      // Create an audio track from the audio sampled by a microphone.
      rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      // Create a video track from the video captured by a camera.
      rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack()
      // Publish the local audio and video tracks to the channel.
      await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack])
      // Dynamically create a container in the form of a DIV element for playing the remote video track.
      const localPlayerContainer = document.createElement('div')
      // Specify the ID of the DIV container. You can use the `uid` of the remote user.
      localPlayerContainer.id = options.uid
      localPlayerContainer.textContent = 'Local user ' + options.uid
      localPlayerContainer.style.width = '640px'
      localPlayerContainer.style.height = '480px'
      document.body.append(localPlayerContainer)

      rtc.localVideoTrack.play(localPlayerContainer)

      console.log('publish success!')
    }

    document.getElementById('audience-join').onclick = async function () {
      rtc.client.setClientRole('audience')
      await rtc.client.join(
        options.appId,
        options.channel,
        options.token,
        options.uid
      )
      rtc.client.on('user-published', async (user, mediaType) => {
        // Subscribe to a remote user.
        await rtc.client.subscribe(user, mediaType)
        console.log('subscribe success')

        // If the subscribed track is video.
        if (mediaType === 'video') {
          // Get `RemoteVideoTrack` in the `user` object.
          const remoteVideoTrack = user.videoTrack
          // Dynamically create a container in the form of a DIV element for playing the remote video track.
          const remotePlayerContainer = document.createElement('div')
          // Specify the ID of the DIV container. You can use the `uid` of the remote user.
          remotePlayerContainer.id = user.uid.toString()
          remotePlayerContainer.textContent =
            'Remote user ' + user.uid.toString()
          remotePlayerContainer.style.width = '640px'
          remotePlayerContainer.style.height = '480px'
          document.body.append(remotePlayerContainer)

          // Play the remote video track.
          // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
          remoteVideoTrack.play(remotePlayerContainer)

          // Or just pass the ID of the DIV container.
          // remoteVideoTrack.play(playerContainer.id);
        }

        // If the subscribed track is audio.
        if (mediaType === 'audio') {
          // Get `RemoteAudioTrack` in the `user` object.
          const remoteAudioTrack = user.audioTrack
          // Play the audio track. No need to pass any DOM element.
          remoteAudioTrack.play()
        }
      })

      rtc.client.on('user-unpublished', (user) => {
        // Get the dynamically created DIV container.
        const remotePlayerContainer = document.getElementById(user.uid)
        // Destroy the container.
        remotePlayerContainer.remove()
      })
    }

    document.getElementById('leave').onclick = async function () {
      // Close all the local tracks.
      rtc.localAudioTrack.close()
      rtc.localVideoTrack.close()
      // Traverse all remote users.
      rtc.client.remoteUsers.forEach((user) => {
        // Destroy the dynamically created DIV containers.
        const playerContainer = document.getElementById(user.uid)
        playerContainer && playerContainer.remove()
      })

      // Leave the channel.
      await rtc.client.leave()
    }
  }
}

startBasicLiveStreaming()

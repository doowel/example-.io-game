const rtc = {
  localAudioTrack: null,
  client: null,
};

const options = {
  appId: 'f904c1940b1740cc943179f51edb436b',
  token:
    '0069debe19a2fdf46e397ec3522b38a0c20IAAgIen6usxs1/VtjgdpSeJfq8Bleph6PyCNvOzOeN4YOwx+f9gAAAAAEACr2OyTNJZyYQEAAQA0lnJh',
};

// Dynamic import the module to avoid SSR compiler check
let _rtcModule;
const getRTCModule = async () => {
  if (_rtcModule === undefined) {
    _rtcModule = await import('agora-rtc-sdk-ng');
  }
  return _rtcModule;
};

const connectToClient = async () => {
  const agora = await getRTCModule();

  // Create an AgoraRTCClient object.
  rtc.client = agora.createClient({ mode: 'rtc', codec: 'vp8' });
  console.log('Create client success');

  // Listen for the "user-published" event, from which you can get an AgoraRTCRemoteUser object.
  rtc.client.on('user-published', async (user, mediaType) => {
    // Subscribe to the remote user when the SDK triggers the "user-published" event
    await rtc.client.subscribe(user, mediaType);
    // userJoinedHandler(user);
    console.log('subscribe success');

    // If the remote user publishes an audio track.
    if (mediaType === 'audio') {
      // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
      const remoteAudioTrack = user.audioTrack;
      // Play the remote audio track.
      remoteAudioTrack.play();
    }

    // Listen for the "user-unpublished" event
    rtc.client.on('user-unpublished', async user => {
      // Unsubscribe from the tracks of the remote user.
      await rtc.client.unsubscribe(user);

    //   userLeaveHandler(user);
    });
  });
};

const joinChannel = async ({ channelId, userId }) => {
  const agora = await getRTCModule();

  await rtc.client.join(options.appId, channelId, options.token, userId);

  // Create a local audio track from the audio sampled by a microphone.
  rtc.localAudioTrack = await agora.createMicrophoneAudioTrack();
  // Publish the local audio tracks to the RTC channel.
  await rtc.client.publish([rtc.localAudioTrack]);

  console.log('publish success!');
};

const leaveChannel = async () => {
  // Destroy the local audio track.
  if (rtc.localAudioTrack !== undefined) {
    rtc.localAudioTrack.close();
  }

  // Leave the channel.
  await rtc.client.leave();
};

export { connectToClient, joinChannel, leaveChannel };

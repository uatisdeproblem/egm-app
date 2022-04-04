import { Html5Qrcode } from 'html5-qrcode';

const stopCamera = () => {
  const html5QrCode = new Html5Qrcode(/* element id */ 'reader');
  html5QrCode
    .stop()
    .then(ignore => {
      console.log('ignore', ignore);
    })
    .catch(err => {
      console.error('error', err);
    });
};

const startCamera = () => {
  // This method will trigger user permissions
  Html5Qrcode.getCameras()
    .then(devices => {
      /**
       * devices would be an array of objects of type:
       * { id: "id", label: "label" }
       */
      if (devices && devices.length) {
        const html5QrCode = new Html5Qrcode(/* element id */ 'reader');
        // If you want to prefer back camera
        // html5QrCode.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback);
        html5QrCode
          .start(
            { facingMode: 'environment' },
            {
              fps: 10, // Optional, frame per seconds for qr code scanning
              qrbox: { width: 250, height: 250 } // Optional, if you want bounded box UI
            },
            (decodedText, decodedResult) => {
              console.log('text', decodedText);
              console.log('result', decodedResult);
              html5QrCode
                .stop()
                .then(ignore => {
                  console.log('ignore', ignore);
                })
                .catch(err => {
                  console.error('stopError', err);
                });
            },
            errorMessage => {
              console.error('startError', errorMessage);
            }
          )
          .catch(err => {
            console.error('cantStartError', err);
          });
      }
    })
    .catch(err => {
      console.error('cantFindError', err);
    });
};

export { startCamera, stopCamera };

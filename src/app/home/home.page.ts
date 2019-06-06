import {Component, OnInit} from '@angular/core';
import * as mobileNet from '@tensorflow-models/mobilenet';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {HttpClient, HttpHeaders} from '@angular/common/http';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    predictions: Array<{ className: string; probability: number }>;
    myPhoto = '../../assets/img/köpek.jpg';
    token: string;

    constructor(private camera: Camera,
                private http: HttpClient) {
        this.http.post('https://www.icibot.net' + '/login',
            {
                userName: 'kemal.siler@b1.com.tr',
                password: 'Ceyar2018'
            }, httpOptions).subscribe(
            resp => {
                // @ts-ignore
                this.token = resp.token_val;
            },
        );
    }

    ngOnInit() {
        this.run();
    }

    async run() {
        const img = document.getElementById('image') as HTMLImageElement;
        // Load the model.
        const model = await mobileNet.load(1, 0.5);
        // Classify the image.
        this.predictions = await model.classify(img, 4);
        console.log('Predictions');
        console.log(this.predictions);
        // Get the logits.
        const logits = model.infer(img);
        console.log('Logits');
        logits.print(true);
        // Get the embedding.
        const embedding = model.infer(img, true);
        console.log('Embedding');
        embedding.print(true);
        this.textTranslate();
    }

    takePhoto() {
        const options: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        };

        this.camera.getPicture(options).then((imageData) => {
            this.myPhoto = 'data:image/jpeg;base64,' + imageData;
            this.run();
        });
    }

    textTranslate() {
        let text = '';
        for (const item of this.predictions) {
            text += item.className + '|';
        }
        this.http.post('https://www.icibot.net/api/text_detect?text=' + text, {
            observe: 'body',
            responseType: 'json'
        }, {
            headers: new HttpHeaders({
                Authorization: 'Bearer ' + this.token
            }),
        }).subscribe(
            (data: string) => {
                if (data != null) {
                    const tData = data.split('|');
                    for (let i = 0; i < this.predictions.length; i++) {
                        this.predictions[i].className = tData[i];
                    }
                }
            }
        );
    }
}

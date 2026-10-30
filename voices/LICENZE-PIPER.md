## en_US-ljspeech-high
# Model card for ljspeech (high)

* Language: en_US (English, United States)
* Speakers: 1
* Quality: high
* Samplerate: 22,050Hz

## Dataset

* URL: https://keithito.com/LJ-Speech-Dataset/
* License: public domain

## Training

See: https://brycebeattie.com/files/tts/

US English female voice. Single speaker. Trained from scratch for 1000 epochs on medium quality settings using the LJ Speech dataset. I reencoded the recordings to a bit rate of 22500 Hz so it would match other voices released for Piper TTS.

## en_GB-cori-high
# Model card for cori (high)

* Language: en_GB (English, Great Britain)
* Speakers: 1
* Quality: high
* Samplerate: 22,050Hz

## Dataset

* URL: https://librivox.org
* License: public domain

## Training

See: https://brycebeattie.com/files/tts/

UK English female voice. Single Speaker. Trained from scratch on high quality settings for 500 epochs. I put together the dataset, which ended up with about 24 hours of recordings. All recordings came from LibriVox.org.

## en_GB-northern_english_male-medium
# Model card for northern_english_male (medium)

* Language: en_GB (English, Great Britain)
* Speakers: 1
* Quality: medium
* Samplerate: 22,050Hz

## Dataset

* URL: http://www.openslr.org/83/
* License: CC-BY-SA 4.0 International

## Training

Finetuned from U.S. English lessac voice (medium quality).


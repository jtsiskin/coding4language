import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
// import * as markov from 'markov'
// import * as Blather from 'blather'y
import Markov from "markov-strings";
// import { ChatFeed, Message } from 'monkas-chat'
import { ChatFeed, Message } from "react-chat-ui";
import * as rwc from "random-weighted-choice";
import Button from "antd/lib/button";

class App extends Component {
  constructor(props) {
    super(props);
    this.fileReader = new FileReader();

    const messages = [
      "Hi!!",
      "I'm a chat bot which will simulate a chat using your facebook messenger history."
    ].map(text => new Message({ id: 1, message: text }));
    this.state = {
      tutorial: true,
      uploaded: false,
      messages,
      // messages: [
      //   new Message({
      //     id: 1,
      //     message: "I'm the recipient! (The person you're talking to)",
      //   }), // Gray bubble
      //   // new Message({ id: 0, message: "I'm you -- the blue bubble!" }), // Blue bubble
      // ],
      is_typing: true,
      idx: 0
    };
    setTimeout(this.playTutorial, 3000);
  }
  playTutorial = () => {
    this.tutorial = [
      { text: "You may be surprised with the memories I surface." },
      {
        text:
          "It sounds scary, but I run completely offline - after downloading your messages from Facebook, you can turn off your internet if you want."
      },
      {
        text:
          "To start, I'll have you visit your facebook settings page and " +
          "then click 'Download your information'."
      },
      {
        text:
          "You'll need to change the format from HTML to JSON",
      },
      {
        text:
          "You'll click 'Deselect All' and then select only the 'Messages' box."
      },
      { text: "You'll then click 'Create File'" },
      { text: "To summarize: Switch download format from HTML -> JSON, only select 'Messages'" },
      {
        text:
          "Click 'Got it' if you understand, and I'll take you to the page.",
        wait: true,
        action: () => {
          let win = window.open(
            "https://www.facebook.com/settings?tab=your_facebook_information",
            "_blank"
          );
          // win.focus();
        },
        response: "Cool, I'll download it!"
      },
      {
        text:
          "It will take a while to create.  Once its ready, download it and unzip it."
      },
      {
        text: "Click 'Got It' when it's downloaded and unzipped.",
        wait: true,
        response: "Yep, its unzipped!"
      },
      {
        text:
          "You can turn off your internet now if you don't trust this website not to upload anything."
      },
      {
        text:
          "You will need to upload the folder called 'inbox' inside of 'messages'"
      },
      {
        text:
          "Don't upload the whole 'messages' folder, just the one labeled 'inbox'"
      },
      {
        text:
          "There will be likely thousands of files, but because nothing is getting uploaded, and its all just running locally in " +
          "the browser, it will process very fast. "
      },
      {
        text: "Click 'Got it' if you understand.",
        wait: true,
        response: "Ok, I'll upload the 'inbox' folder."
      },
      {
        text:
          "Now, click the 'Upload Inbox' button at the bottom of this screen, and choose the 'inbox' folder."
      },
      { text: "After that, your simulated conversations will begin!" },
      { text: "Bye!!" }
    ];
    const { idx, tutorial } = this.state;
    if (!tutorial) return;
    const current = this.tutorial[idx];
    if (!current){
      this.setState({ tutorial: false });
      return;
    }
    this.setState({
      idx: idx + 1,
      messages: this.state.messages.concat([
        new Message({ id: 1, message: current.text })
      ])
    });
    if (!current.wait) {
      const delay = this.calculateDelay(current.text.length) * (3/4);
      //make it go a little faster because it waits for their input
      setTimeout(this.playTutorial, delay);
    } else {
      this.setState({ is_typing: false });
    }
  };

  gotIt = () => {
    if (!this.tutorial) return;
    const { idx } = this.state;
    const current = this.tutorial[idx - 1];
    if (!current) return;

    if (current.action) {
      current.action();
    }
    if (current.response) {
      this.setState({
        messages: this.state.messages.concat([
          new Message({ id: 0, message: current.response })
        ])
      });
    }
    this.setState({ is_typing: true });
    setTimeout(this.playTutorial, 2000);
  };

  handleFiles = async event => {
    console.log(this.fileInput.files);
    if (!this.fileInput.files) {
      return;
    }

    this.setState({
      messages: this.state.messages.concat([
        new Message({
          id: 0,
          message:
            "Here are my files!"
        })
      ])
    });

    const files = this.fileInput.files;
    const parsedFiles = [];
    const promises = [];
    let htmlFormat = false;
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (file.name === "message.html") {
        htmlFormat = true;
      }
      if (file.name !== "message.json") continue;
      try {
        const reader = new FileReader();
        promises.push(
          new Promise((resolve, reject) => {
            reader.onload = e => {
              try {
                parsedFiles.push(JSON.parse(e.target.result));
              } catch(e) {
                reject();
              }
              resolve();
            };
          })
        );
        reader.readAsText(file, "jklkjlk");
      } catch (e) {

      }
    }
    await Promise.all(promises);

    // console.log(parsedFiles);
    const allParticipants = {};
    parsedFiles.forEach(parsed => {
      parsed.participants.forEach(participant => {
        if (allParticipants[participant.name]) {
          allParticipants[participant.name] += 1;
        } else {
          allParticipants[participant.name] = 1;
        }
      });
    });
    if (Object.keys(allParticipants).length < 3) {
      let text = "I had an issue. Did you upload the 'inbox' folder within 'messages' and download it in JSON format?";
      if (htmlFormat) {
        text = "I think you downloaded it as HTML instead of JSON.  Could you please redownload from facebook?"
      }
      this.setState({
        messages: this.state.messages.concat([
          new Message({
            id: 1,
            message:
              text
          })
        ])
      });
      return;
    }

    const me = Object.keys(allParticipants).reduce((a, b) =>
      allParticipants[a] > allParticipants[b] ? a : b
    );

    console.log("MY NAME IS: ", me);

    this.setState({ tutorial: false, uploaded: true, messages: this.state.messages.concat([
        new Message({
          id: 1,
          message:
            "Perfect, I'm running my algorithms!",
        }),
        new Message({
          id: 1,
          message: "This will take a few seconds, then the conversation will begin.",
        })
      ]) });

    const myText = [];
    const otherText = [];
    const userFrequencies = {};

    parsedFiles.forEach(parsed => {
      parsed.messages.forEach(message => {
        if (!message.content) return;
        if (message.content.length > 400) return;
        const content = message.content.replace(/â/gm, "'");
        if (message.sender_name !== me) {
          userFrequencies[message.sender_name] = userFrequencies[
            message.sender_name
          ]
            ? userFrequencies[message.sender_name] + 1
            : 1;

          otherText.push(content);
        } else {
          myText.push(content);
        }
      });
    });
    this.table = Object.keys(userFrequencies).map(name => {
      return { weight: userFrequencies[name], id: name };
    });

    // 'markov'
    // let m = markov(3);
    // const seeders = myText.map((line) => {
    //   return new Promise((resolve, reject) => {
    //     m.seed(line, resolve)
    //   })
    // })
    // await Promise.all(seeders);
    // console.log("DONE");
    // for (let i = 0; i < 20; i += 1)
    //   console.log(m.respond(m.pick(), Math.floor(Math.random()*15 + 6 )).join(" "))

    // 'blather'
    // const b = new Blather({
    //   depth: 2
    // })
    // myText.forEach((line) =>  b.addFragment(line))
    // console.log("DONE");
    // for (let i = 0; i < 20; i += 1)
    //   console.log(b.generateFragment())

    // 'markov-strings'
    setTimeout(() => {
      this.myMarkov = new Markov(myText, {stateSize: 2});
      this.myMarkov.buildCorpus();
      console.log("CORPUS BUILT");
      //
      // for (let i = 0; i < 20; i += 1)
      //   console.log(this.myMarkov.generate(options))

      console.log("OTHER TEXT:");
      this.otherMarkov = new Markov(otherText, {stateSize: 3});
      this.otherMarkov.buildCorpus();
      console.log("CORPUS BUILT");

      this.setState({is_typing: true, messages: []})
      this.addMessage(false);
    }, 0);
    // for (let i = 0; i < 20; i += 1)
    //   console.log(otherMarkov.generate(options))
  };

  addMessage = mine => {
    const options = {
      maxTries: 1000, // Give up if I don't have a sentence after 20 tries (default is 10)
      filter: result => {
        return result.string.split(" ").length >= 5 && result.refs.length >= 3;
      }
    };
    let length;
    if (mine) {
      const generated = this.myMarkov.generate(options);
      console.log(generated);
      const text = generated.string;
      length = text.length;
      this.setState({
        messages: this.state.messages.concat([
          new Message({ id: 0, message: text })
        ])
      });
    } else {
      const generated = this.otherMarkov.generate(options);
      console.log(generated);
      const text = generated.string;
      length = text.length;
      const senderName = rwc(this.table);
      this.setState({
        is_typing: false,
        messages: this.state.messages.concat([
          new Message({ id: 1, message: text, senderName })
        ])
      });
    }
    const delay = this.calculateDelay(length);
    if (mine) setTimeout(() => this.setState({ is_typing: true }), delay / 2);
    setTimeout(() => this.addMessage(!mine), delay);
  };

  calculateDelay = length => {
    const wpm = 180;
    const words = length / 5;
    return (words / wpm) * 60 * 1000 + 500;
  };

  onRef = element => {
    this.fileInput = element;
  };
  uploadButtonClick = () => {
    this.fileInput.click();
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ChatFeed
            messages={this.state.messages} // Boolean: list of message objects
            isTyping={this.state.is_typing} // Boolean: is the recipient typing
            hasInputField={false} // Boolean: use our input, or use your own
            bubbleStyles={{
              userBubble: { backgroundColor: "#057BFE", color: "#EBF4FA" },
              chatbubble: { backgroundColor: "#E6E5EB", color: "#060608" },
              text: {}
            }}
            showSenderName
          />
          {this.state.tutorial && (
            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={this.gotIt}
            >
              Got it!
            </Button>
          )}
          {!this.state.uploaded && (
            <Button onClick={this.uploadButtonClick}>Upload 'inbox'</Button>
          )}
          <input
            hidden
            ref={this.onRef}
            type="file"
            id="file_input"
            webkitdirectory=""
            directory=""
            onChange={this.handleFiles}
          />
        </header>
      </div>
    );
  }
}

export default App;

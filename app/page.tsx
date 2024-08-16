"use client";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ChangeEvent, useEffect, useState} from "react";
import {useSocket} from "@/app/useSocket";

export default function Home() {
  const socket = useSocket();
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for events
    function onMessage(event) {
      if (event.data === "<EOM>") {
        setLoading(false);
      } else {
        setCaption(caption => caption + event.data);
      }
    }
    socket.addEventListener('message', onMessage);

    return () => {
      socket.removeEventListener("message", onMessage);
    }
  });

  const onSubmit = (event) => {
    event.preventDefault();
    if (event.target.file.files.length === 0) { return; }

    setCaption("");
    setLoading(true);

    const fileBlob = event.target.file.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      socket.send(reader.result);
    }
    reader.readAsArrayBuffer(fileBlob);
  };

  function getImageData(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files.length === 0) { return ""; }

    return URL.createObjectURL(event.target.files![0]);
  }

  return (
    <main className={"min-h-screen flex flex-col items-center mb-8"}>
      <h1 className="font-bold text-2xl my-4">BLIP - Image to Text</h1>
      <div className="bg-white p-5 rounded-2xl border-2">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <div>
            <Label htmlFor={"picture"}>Image Upload</Label>
            <Input id="picture" type="file" name="file" onChange={(event) => {
              const displayUrl = getImageData(event)
              setPreview(displayUrl);
            }}/>
          </div>
          <img src={preview} alt={preview ? "the chosen image" : ""}/>
          <Button type="submit">Upload files</Button>
        </form>
      </div>

      <div className="bg-white p-5 rounded-2xl border-2 mt-4">
        <div className="flex flex-row items-center gap-2">
          <strong>Socket Response</strong>
          {loading && <span className="loader" />}
        </div>
        <p>{caption}</p>
      </div>
    </main>
  );
}

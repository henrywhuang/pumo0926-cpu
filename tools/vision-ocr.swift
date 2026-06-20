import AppKit
import Foundation
import Vision

struct OcrLine: Codable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

guard CommandLine.arguments.count >= 2 else {
    fputs("Usage: swift tools/vision-ocr.swift <image>\n", stderr)
    exit(1)
}

let imagePath = CommandLine.arguments[1]
let imageUrl = URL(fileURLWithPath: imagePath)

guard let nsImage = NSImage(contentsOf: imageUrl) else {
    fputs("Failed to read image: \(imagePath)\n", stderr)
    exit(1)
}

var proposedRect = CGRect(origin: .zero, size: nsImage.size)
guard let cgImage = nsImage.cgImage(forProposedRect: &proposedRect, context: nil, hints: nil) else {
    fputs("Failed to create CGImage: \(imagePath)\n", stderr)
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
let requestedLanguages = ProcessInfo.processInfo.environment["VISION_OCR_LANGS"]?
    .split(separator: ",")
    .map { String($0).trimmingCharacters(in: .whitespacesAndNewlines) }
    .filter { !$0.isEmpty }
request.recognitionLanguages = requestedLanguages?.isEmpty == false ? requestedLanguages! : ["en-US", "zh-Hans"]
request.minimumTextHeight = 0.005

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try handler.perform([request])

let lines = (request.results ?? [])
    .compactMap { observation -> OcrLine? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let box = observation.boundingBox
        return OcrLine(
            text: candidate.string,
            confidence: candidate.confidence,
            x: box.origin.x,
            y: box.origin.y,
            width: box.size.width,
            height: box.size.height
        )
    }
    .sorted {
        if abs($0.y - $1.y) > 0.01 {
            return $0.y > $1.y
        }
        return $0.x < $1.x
    }

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try encoder.encode(lines)
FileHandle.standardOutput.write(data)
FileHandle.standardOutput.write(Data("\n".utf8))

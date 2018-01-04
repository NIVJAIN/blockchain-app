# $env:path="$env:Path;C:\Python27"

#import azure.storage.blob as azureblob

from pyPdf import PdfFileWriter, PdfFileReader
from reportlab.pdfgen import canvas
import sys

# blob_client = azureblob.BlockBlobService(
#     account_name='ngpblockchain',
#     account_key='oRvh4d3sM4epS+2j5JwInsaCQYzSpc/9DlBSlxVJzzQq0pij5kv3UD99Ca7X1ik++PC+NkY5/DZw//S6YfWA8g==')


# APP_CONTAINER_NAME = 'ngpblockchain'
# INPUT_CONTAINER_NAME = 'inbound'
# OUTPUT_CONTAINER_NAME = 'outbound'
# blob_client.create_container(APP_CONTAINER_NAME, fail_on_exist=False)
# blob_client.create_container(INPUT_CONTAINER_NAME, fail_on_exist=False)
# blob_client.create_container(OUTPUT_CONTAINER_NAME, fail_on_exist=False)

c= canvas.Canvas("watermark.pdf")
c.setFont("Courier", 8) #60
c.setFillGray(0.5,0.5)
c.saveState()
# .translate(500,100)
c.translate(50,390)
c.rotate(90)
#c.drawCentredString(0, 0, "A WATERMARK!")

# c.drawCentredString(0, 0, sys.argv[1])
# c.drawCentredString(0, 5, sys.argv[2])
# c.drawCentredString(0, 10, sys.argv[3])
# c.drawCentredString(0, 15, sys.argv[4])


# c.drawCentredString(0, 15, sys.argv[1])
# c.drawCentredString(0, 25, sys.argv[2])
# c.drawCentredString(0, 35, sys.argv[3])
# c.drawCentredString(0, 45, sys.argv[4])
#
c.drawCentredString(0, 10, sys.argv[1])
c.drawCentredString(0, 20, sys.argv[2])
c.drawCentredString(0, 30, sys.argv[3])
c.drawCentredString(0, 40, sys.argv[4])

lowercaseoffilename = sys.argv[5]
filen = lowercaseoffilename.lower()
#c.drawCentredString(0, 600, "A WATERMARK!")
c.restoreState()
c.save()
output = PdfFileWriter()
input1 = PdfFileReader(file("output.pdf", "rb"))
print "title = %s" % (input1.getDocumentInfo().title)
watermark = PdfFileReader(file("watermark.pdf", "rb"))
for i in range(0, input1.numPages):
    page1 = input1.getPage(i)
    page1.mergePage(watermark.getPage(0))
    output.addPage(page1)
print "watermarked_pdf.pdf has %s pages." % input1.getNumPages()
outputStream = file(filen +".pdf", "wb")
output.write(outputStream)
outputStream.close()
